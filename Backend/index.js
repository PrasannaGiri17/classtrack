// index.js
require("dotenv").config(); // load .env first

const express = require("express");
const cors = require("cors");
const connectDB = require("./database");

const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes"); // ✅ add this
const schoolRoutes = require("./routes/schoolRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const routineRoutes = require("./routes/routineRoutes");
const authRoutes = require("./routes/UserAuth");

const app = express();
const port = 7000;

// middlewares
// middlewares
app.use(cors({
  origin: "http://localhost:3000", // Allow frontend origin
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: "10mb" })); // Increase limit for base64 images

// connect MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send("Hello from the Backend server!");
});

// routes
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes); // ✅ now: /teachers, /teachers/add, /teachers/:id
app.use("/api/school", schoolRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/routines", routineRoutes);
app.use("/api/auth", authRoutes);    // /api/auth/register, /api/auth/login, etc.

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
