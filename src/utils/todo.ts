import type { Todo } from "./types";

let todos: Todo[] = []; // Original todos array
let displayedTodos: Todo[] = []; // Copy of the first 10 todos

export const getTodoList = async (): Promise<Todo[]> => {
    try {
        return todos;
    } catch (error) {
        console.log("err", error);
        return [];
    }
};

export const addTodo = async (t: Todo): Promise<Todo | undefined> => {
    try {
      const newTodo: Todo = {
        ...t,
        id: todos.length > 0 ? todos[todos.length - 1].id + 1 : 1, // Generate the next ID
      };
  
      todos.push(newTodo); // Add to the main todos array
  
      console.log("Added Todo:", newTodo);
      return newTodo;
    } catch (error) {
      console.log("Error adding todo:", error);
      return undefined;
    }
  };

export const getNextId = async (): Promise<number> => {
    if (displayedTodos.length === 0) {
        await getTodoList();
    }
    const maxId = displayedTodos.reduce((max, todo) => (todo.id > max ? todo.id : max), 0);
    const nextId = maxId + 1;
    console.log(nextId, maxId);
    return nextId;
};

export const updateTodo = async (id: number, updatedFields: Partial<Todo>): Promise<Todo | undefined> => {
    try {
        const index = todos.findIndex((todo) => todo.id === id);
        if (index === -1) {
            console.log(`Todo with id ${id} not found`);
            return undefined;
        }

        todos[index] = { ...todos[index], ...updatedFields };

        const displayedIndex = displayedTodos.findIndex((todo) => todo.id === id);
        if (displayedIndex !== -1) {
            displayedTodos[displayedIndex] = { ...displayedTodos[displayedIndex], ...updatedFields };
        }

        console.log("Updated Todo:", todos[index]);
        return todos[index];
    } catch (error) {
        console.log("Error updating todo:", error);
        return undefined;
    }
};

export const deleteTodo = async (id: number): Promise<boolean> => {
    try {
        const todosLength = todos.length;
        todos = todos.filter((todo) => todo.id !== id);

        displayedTodos = displayedTodos.filter((todo) => todo.id !== id);

        if (todos.length < todosLength) {
            console.log(`Todo with id ${id} deleted`);
            return true;
        } else {
            console.log(`Todo with id ${id} not found`);
            return false;
        }
    } catch (error) {
        console.log("Error deleting todo:", error);
        return false;
    }
};

export const pinTodo = async (id: number): Promise<Todo | undefined> => {
    try {
      const index = todos.findIndex((todo) => todo.id === id);
      if (index === -1) {
        console.log(`Todo with id ${id} not found`);
        return undefined;
      }
  
      // Toggle the pinned state
      todos[index].pinned = !todos[index].pinned;
  
      console.log("Pinned/Unpinned Todo:", todos[index]);
      return todos[index];
    } catch (error) {
      console.log("Error pinning/unpinning todo:", error);
      return undefined;
    }
  };