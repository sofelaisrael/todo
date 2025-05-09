import type { Todo } from "./types";

const API_URL = "https://jsonplaceholder.typicode.com/todos";

export const getTodoList = async (): Promise<Todo[]> => {
  try {
    const res = await fetch(`${API_URL}?_limit=10`);
    const todos: Todo[] = await res.json();
    return todos;
  } catch (error) {
    console.error("Error fetching todos:", error);
    return [];
  }
};

export const addTodo = async (t: Todo): Promise<Todo | undefined> => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t),
    });

    const newTodo: Todo = await res.json();
    console.log("Added Todo:", newTodo);
    return newTodo;
  } catch (error) {
    console.error("Error adding todo:", error);
    return undefined;
  }
};

export const getNextId = async (): Promise<number> => {
  const todos = await getTodoList();
  const maxId = todos.reduce((max, todo) => (todo.id > max ? todo.id : max), 0);
  return maxId + 1;
};

export const updateTodo = async (
  id: number,
  updatedFields: Partial<Todo>
): Promise<Todo | undefined> => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });

    const updatedTodo: Todo = await res.json();
    console.log("Updated Todo:", updatedTodo);
    return updatedTodo;
  } catch (error) {
    console.error("Error updating todo:", error);
    return undefined;
  }
};

export const deleteTodo = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    const success = res.ok;
    console.log(success ? `Todo ${id} deleted` : `Todo ${id} not found`);
    return success;
  } catch (error) {
    console.error("Error deleting todo:", error);
    return false;
  }
};

export const pinTodo = async (id: number): Promise<Todo | undefined> => {
  try {
    const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
    const todo = await res.json();

    const updated = {
      ...todo,
      pinned: !todo.pinned, // toggle
    };

    const putRes = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    return await putRes.json(); // <- this should return the updated todo
  } catch (err) {
    console.error("Pin error:", err);
    return undefined;
  }
};

