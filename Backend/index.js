// index.js
require("dotenv").config(); // load .env first

const express = require("express");
const cors = require("cors");
const connectDB = require("./database");

const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes"); // ✅ add this
const authRoutes = require("./routes/UserAuth");

const app = express();
const port = 7000;

// middlewares
app.use(cors());
app.use(express.json());

// connect MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send("Hello from the Backend server!");
});

// routes
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes); // ✅ now: /teachers, /teachers/add, /teachers/:id
app.use("/api/auth", authRoutes);    // /api/auth/register, /api/auth/login, etc.

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
