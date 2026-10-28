
import { useState, useEffect } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/todos";

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load Todo items from the backend when the page opens
  useEffect(() => {
    async function fetchTodos() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to load tasks.");
        }

        const data = await response.json();

        // Convert backend "text" to frontend "title"
        setTodos(
          data.map((todo) => ({
            ...todo,
            title: todo.text,
          }))
        );
      } catch (err) {
        setError("Couldn't connect to the backend. Is the server running?");
      } finally {
        setLoading(false);
      }
    }

    fetchTodos();
  }, []);

  // Add a new Todo item
  async function addTodo(event) {
    event.preventDefault();

    const title = task.trim();
    if (!title) return;

    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: title }),
      });

      if (!response.ok) {
        throw new Error("Failed to add task.");
      }

      const newTodo = await response.json();

      setTodos((currentTodos) => [
        ...currentTodos,
        { ...newTodo, title: newTodo.text },
      ]);

      setTask("");
    } catch (err) {
      setError("Couldn't add the task. Please try again.");
    }
  }

  // Toggle a Todo item's completed status
  async function toggleTodo(id) {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to update task.");
      }

      const updatedTodo = await response.json();

      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === id
            ? { ...updatedTodo, title: updatedTodo.text }
            : todo
        )
      );
    } catch (err) {
      setError("Couldn't update the task. Please try again.");
    }
  }

  // Delete a Todo item
  async function deleteTodo(id) {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task.");
      }

      setTodos((currentTodos) =>
        currentTodos.filter((todo) => todo.id !== id)
      );
    } catch (err) {
      setError("Couldn't delete the task. Please try again.");
    }
  }

  const completedCount = todos.filter(
    (todo) => todo.completed
  ).length;

  return (
    <main className="app">
      <header className="app-header">
        <p className="eyebrow">YOUR PERSONAL PLANNER</p>
        <h1>My Todo List</h1>
        <p className="subtitle">
          One task at a time. Make today count.
        </p>
      </header>

      <section className="todo-card">
        <form className="todo-form" onSubmit={addTodo}>
          <input
            type="text"
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder="What needs to get done?"
            aria-label="New task"
          />
          <button type="submit" disabled={loading}>
            Add task
          </button>
        </form>

        {error && <p role="alert">{error}</p>}

        <div className="todo-summary">
          <span>{todos.length} total</span>
          <span>{completedCount} completed</span>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading your tasks...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">✓</span>
            <h2>You're all clear!</h2>
            <p>Add a task above to get started.</p>
          </div>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li
                className={`todo-item ${
                  todo.completed ? "completed" : ""
                }`}
                key={todo.id}
              >
                <label className="todo-label">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span>{todo.title}</span>
                </label>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`Delete ${todo.title}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="app-footer">
        Built with React · Small steps, big progress.
      </footer>
    </main>
  );
}

export default App;
