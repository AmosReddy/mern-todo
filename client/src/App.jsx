
import { useState, useEffect } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/todos";

const API_BASE = API_URL.replace(/\/api\/todos\/?$/, "");
const TODOS_URL = `${API_BASE}/api/todos`;
const AUTH_URL = `${API_BASE}/api/auth`;

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchTodos() {
    const response = await fetch(TODOS_URL, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to load tasks");
    }

    const data = await response.json();

    setTodos(
      data.map((todo) => ({
        ...todo,
        title: todo.text,
      }))
    );
  }

  // Restore the login session when the page opens
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch(`${AUTH_URL}/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data.user);

        await fetchTodos();
      } catch {
        setError("Couldn't connect to the backend.");
      } finally {
        setAuthLoading(false);
      }
    }

    checkSession();
  }, []);

  // Register or log in
  async function handleAuth(event) {
    event.preventDefault();
    setError("");

    try {
      const endpoint =
        authMode === "login" ? "login" : "register";

      const body =
        authMode === "login"
          ? { email, password }
          : { name, email, password };

      const response = await fetch(`${AUTH_URL}/${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // Registration is followed by login to establish a session
      if (authMode === "register") {
        const loginResponse = await fetch(`${AUTH_URL}/login`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
          throw new Error(loginData.message || "Please log in");
        }

        setUser(loginData.user);
      } else {
        setUser(data.user);
      }

      setPassword("");
      setName("");
      await fetchTodos();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  // Logout
  async function logout() {
    try {
      await fetch(`${AUTH_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setTodos([]);
      setTask("");
      setPassword("");
      setError("");
    }
  }

  // Add a Todo
  async function addTodo(event) {
    event.preventDefault();

    const title = task.trim();
    if (!title) return;

    try {
      setError("");

      const response = await fetch(TODOS_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: title }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add task");
      }

      setTodos((current) => [
        ...current,
        { ...data, title: data.text },
      ]);

      setTask("");
    } catch (err) {
      setError(err.message || "Couldn't add the task.");
    }
  }

  // Toggle a Todo
  async function toggleTodo(id) {
    try {
      setError("");

      const response = await fetch(`${TODOS_URL}/${id}`, {
        method: "PATCH",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update task");
      }

      setTodos((current) =>
        current.map((todo) =>
          todo.id === id ? { ...data, title: data.text } : todo
        )
      );
    } catch (err) {
      setError(err.message || "Couldn't update the task.");
    }
  }

  // Delete a Todo
  async function deleteTodo(id) {
    try {
      setError("");

      const response = await fetch(`${TODOS_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete task");
      }

      setTodos((current) =>
        current.filter((todo) => todo.id !== id)
      );
    } catch (err) {
      setError(err.message || "Couldn't delete the task.");
    }
  }

  const completedCount = todos.filter(
    (todo) => todo.completed
  ).length;

  if (authLoading) {
    return (
      <main className="app">
        <div className="empty-state">
          <p>Checking your session...</p>
        </div>
      </main>
    );
  }

  // Login and registration screen
  if (!user) {
    return (
      <main className="app">
        <header className="app-header">
          <p className="eyebrow">YOUR PERSONAL PLANNER</p>
          <h1>{authMode === "login" ? "Welcome Back" : "Create Account"}</h1>
          <p className="subtitle">
            {authMode === "login"
              ? "Log in to access your tasks."
              : "Create an account to get started."}
          </p>
        </header>

        <section className="todo-card">
          <form className="todo-form" onSubmit={handleAuth}>
            {authMode === "register" && (
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
              />
            )}

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password (at least 8 characters)"
              minLength={8}
              required
            />

            <button type="submit">
              {authMode === "login" ? "Log in" : "Register"}
            </button>
          </form>

          {error && <p role="alert">{error}</p>}

          <p>
            {authMode === "login"
              ? "Don't have an account? "
              : "Already registered? "}

            <button
              type="button"
              onClick={() => {
                setAuthMode(
                  authMode === "login" ? "register" : "login"
                );
                setError("");
              }}
            >
              {authMode === "login" ? "Register" : "Log in"}
            </button>
          </p>
        </section>
      </main>
    );
  }

  // Logged-in Todo screen
  return (
    <main className="app">
      <header className="app-header">
        <p className="eyebrow">YOUR PERSONAL PLANNER</p>
        <h1>My Todo List</h1>
        <p className="subtitle">
          Welcome, {user.name}!
        </p>
        <button type="button" onClick={logout}>
          Log out
        </button>
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
