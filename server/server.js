
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware to read JSON request bodies
app.use(express.json());
app.use(cors());

// Temporary storage for Todo items
let todos = [];
let nextId = 1;

// Check whether the API is running
app.get("/", (req, res) => {
  res.json({ message: "Todo API is running" });
});

// Get all Todo items
app.get("/api/todos", (req, res) => {
  res.json(todos);
});

// Add a new Todo item
app.post("/api/todos", (req, res) => {
  const { text } = req.body;

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({
      message: "Todo text is required",
    });
  }

  const newTodo = {
    id: nextId++,
    text: text.trim(),
    completed: false,
  };

  todos.push(newTodo);

  res.status(201).json(newTodo);
});

// Mark a Todo as completed or incomplete
app.patch("/api/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find((item) => item.id === id);

  if (!todo) {
    return res.status(404).json({
      message: "Todo not found",
    });
  }

  todo.completed = !todo.completed;

  res.json(todo);
});

// Delete a Todo item
app.delete("/api/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = todos.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Todo not found",
    });
  }

  const deletedTodo = todos.splice(index, 1)[0];

  res.json({
    message: "Todo deleted successfully",
    todo: deletedTodo,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
