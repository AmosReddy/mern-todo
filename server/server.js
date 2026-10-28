
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Todo = require("./models/Todo");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Todo API is running" });
});

// Get all todos
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });

    res.json(
      todos.map((todo) => ({
        id: todo._id.toString(),
        text: todo.text,
        completed: todo.completed,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch todos" });
  }
});

// Create a todo
app.post("/api/todos", async (req, res) => {
  try {
    const { text } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Todo text is required",
      });
    }

    const todo = await Todo.create({
      text: text.trim(),
    });

    res.status(201).json({
      id: todo._id.toString(),
      text: todo.text,
      completed: todo.completed,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create todo" });
  }
});

// Toggle a todo's completed status
app.patch("/api/todos/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid todo ID" });
    }

    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.json({
      id: todo._id.toString(),
      text: todo.text,
      completed: todo.completed,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update todo" });
  }
});

// Delete a todo
app.delete("/api/todos/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid todo ID" });
    }

    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete todo" });
  }
});

// Connect to MongoDB before accepting requests
async function startServer() {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is missing from the .env file");
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB Atlas");

   app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
