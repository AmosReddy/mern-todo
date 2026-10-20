
import { useState } from "react";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");

  function addTodo(event) {
    event.preventDefault();

    const title = task.trim();

    if (!title) return;

    const newTodo = {
      id: crypto.randomUUID(),
      title: title,
      completed: false,
    };

    setTodos((currentTodos) => [...currentTodos, newTodo]);
    setTask("");
  }

  function toggleTodo(id) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  }

  function deleteTodo(id) {
    setTodos((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== id)
    );
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
          <button type="submit">Add task</button>
        </form>

        <div className="todo-summary">
          <span>{todos.length} total</span>
          <span>{completedCount} completed</span>
        </div>

        {todos.length === 0 ? (
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
