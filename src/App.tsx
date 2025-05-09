import { useState, useEffect } from "react";
import {
  addTodo,
  getTodoList,
  getNextId,
  updateTodo,
  deleteTodo,
  pinTodo,
} from "./utils/todo";
import type { Todo } from "./utils/types";
import "./App.css";

function App() {
  const [todo, setTodo] = useState<Todo[]>([])
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [todoTitle, setTodoTitle] = useState<string>("")
  const [dueHours, setDueHours] = useState<string>("")
  const [dueDays, setDueDays] = useState<string>("")
  const [editTodoId, setEditTodoId] = useState<number | null>(null)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  

  useEffect(() => {
    const fetchTodos = async () => {
      const data = await getTodoList()
      if (data) {
        setTodo(data)
      }
    }
    fetchTodos()
  }, [])

  const calculateDueTime = (dueDate: string | undefined): string => {
    if (!dueDate) return "No specified date"
  
    const due = new Date(dueDate)
  
  
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  
    return `Due at ${due.toLocaleTimeString("en-US", options)}`
  }

  const calculateNewDueDate = (days: string, hours: string): Date | null => {
    if (!days && !hours) return null

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + (parseInt(days) || 0))
    dueDate.setHours(dueDate.getHours() + (parseInt(hours) || 0))
    return dueDate
  }

  const handleAdd = async () => {
    if (!todoTitle) {
      setError("Task title is required.")
      return
    }

  
    if (todo.some((t) => t.title.toLowerCase() === todoTitle.toLowerCase())) {
      setError("Task title already exists.")
      return
    }

    if (!dueHours && !dueDays) {
      setError("Please specify a time limit.")
      return
    }

    const nextId = await getNextId()
    const dueDate = calculateNewDueDate(dueDays, dueHours)

    const newTodo: Todo = {
      id: nextId,
      title: todoTitle,
      completed: false,
      pinned: false,
      createdAt: new Date().toISOString(),
      dueDate: dueDate ? dueDate.toISOString() : "",
      index: todo.length,
    }

    const addedTodo = await addTodo(newTodo)
    if (addedTodo) {
    
      setTodo((prevTodos) => {
        if (prevTodos.some((t) => t.id === addedTodo.id)) {
          return prevTodos
        }
        return [...prevTodos, addedTodo]
      })

    
      setTodoTitle("")
      setDueHours("")
      setDueDays("")
      setError("")
      setShowModal(false)
    }
  }

  const handleEdit = async (
    id: number | null,
    updatedFields: Partial<Todo>
  ) => {
    if (id === null) return

    if (!todoTitle) {
      setError("Task title is required.")
      return
    }

    if (
      todo.some(
        (t) => t.title.toLowerCase() === todoTitle.toLowerCase() && t.id !== id
      )
    ) {
      setError("Task title already exists.")
      return
    }

    if (!dueHours && !dueDays) {
      setError("Please specify a time limit.")
      return
    }

    const updatedTodo = await updateTodo(id, updatedFields)
    if (updatedTodo) {
      setTodo((prevTodos) =>
        prevTodos.map((t) => (t.id === id ? updatedTodo : t))
      )
      setShowEditModal(false)
      setTodoTitle("")
      setDueHours("")
      setDueDays("")
      setIsCompleted(false)
      setEditTodoId(null)
      setError("")
    }
  }

  const handlePin = async (id: number) => {
    const updatedTodo = await pinTodo(id);
    if (updatedTodo) {
      setTodo((prevTodos) =>
        prevTodos
          .map((t) => (t.id === id ? updatedTodo : t))
          .sort((a: Todo, b: Todo) => {
            // Sort by pinned status first
            if (b.pinned !== a.pinned) return Number(b.pinned) - Number(a.pinned);
  
            // Fallback to 0 if index is undefined
            const aIndex = a.index ?? 0;
            const bIndex = b.index ?? 0;
  
            // Sort by original index
            return aIndex - bIndex;
          })
      );
    }
  };

  const handleDelete = async (id: number) => {
    const isDeleted = await deleteTodo(id)
    if (isDeleted) {
      setTodo((prevTodos) => prevTodos.filter((t) => t.id !== id))
    }
  }

  const openEditModal = (id: number, task: Todo) => {
    setEditTodoId(id);
    setTodoTitle(task.title);
    setIsCompleted(task.completed);
  
    const dueDate = task.dueDate ? new Date(task.dueDate) : new Date(); // Fallback to current date
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
  
    setDueDays(Math.floor(diff / (1000 * 60 * 60 * 24)).toString());
    setDueHours(
      Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString()
    );
    setShowEditModal(true);
    setShowModal(false);
  };

  const openAddModal = () => {
    setTodoTitle("")
    setDueDays("")
    setDueHours("")
    setError("")
    setShowModal(true)
    setShowEditModal(false)
  }

  return (
    <>
      <div className="todo-container">
        <h1>Todo List</h1>
        <button onClick={openAddModal} className="add-task-button">
          Add New Task
        </button>
        {error && <div className="error-message">{error}</div>}
        {todo.length === 0 ? (
          <div className="empty-state">You have no tasks</div>
        ) : (
          <div className="todo-list">
            {todo.map((t) => (
              <div
                key={t.id}
                className={`todo-item ${t.completed ? "completed-task" : ""} ${
                  t.pinned ? "pinned-task" : ""
                }`}
              >
                <p className="todo-title">{t.title}</p>
                <p className="todo-status">
                  {t.completed ? "Completed" : "Not Completed"}
                </p>
                <p className="todo-due">
                {calculateDueTime(t.dueDate)}
                </p>
                <div className="todo-actions">
                  <button
                    onClick={() => openEditModal(t.id, t)}
                    title="Edit Task"
                    className="action-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handlePin(t.id)}
                    title={t.pinned ? "Unpin Task" : "Pin Task"}
                    className="action-button"
                  >
                    Pin
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    title="Delete Task"
                    className="action-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Task</h2>
            <input
              type="text"
              placeholder="Task Title"
              value={todoTitle}
              onChange={(e) => setTodoTitle(e.target.value)}
            />
            <div>
              <label>Days:</label>
              <input
                type="number"
                placeholder="Enter days"
                value={dueDays}
                onChange={(e) => setDueDays(e.target.value)}
              />
            </div>
            <div>
              <label>Hours:</label>
              <input
                type="number"
                placeholder="Enter hours"
                value={dueHours}
                onChange={(e) => setDueHours(e.target.value)}
              />
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                />
                Completed
              </label>
            </div>
            <button className='border p-3 m-3'
              onClick={() =>
                handleEdit(editTodoId, {
                  title: todoTitle,
                  dueDate: calculateNewDueDate(
                    dueDays,
                    dueHours
                  )?.toISOString(),
                  completed: isCompleted,
                })
              }
            >
              Save Changes
            </button>
            <button className='border p-3 m-3' onClick={() => setShowEditModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Task</h2>
            <input
              type="text"
              placeholder="Task Title"
              value={todoTitle}
              onChange={(e) => setTodoTitle(e.target.value)}
            />
            <div>
              <label>Days:</label>
              <input
                type="number"
                placeholder="Enter days"
                value={dueDays}
                onChange={(e) => setDueDays(e.target.value)}
              />
            </div>
            <div>
              <label>Hours:</label>
              <input
                type="number"
                placeholder="Enter hours"
                value={dueHours}
                onChange={(e) => setDueHours(e.target.value)}
              />
            </div>
            <button className='border p-3 m-3' onClick={handleAdd}>Add Task</button>
            <button className='border p-3 m-3' onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
