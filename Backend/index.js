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
const timetableRoutes = require("./routes/timetableRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const examRoutes = require("./routes/examRoutes");
const resultRoutes = require("./routes/resultRoutes");
const authRoutes = require("./routes/UserAuth");

const app = express();
const port = 7000;

// middlewares
// middlewares
app.use(cors({
  origin: "http://localhost:3000", // Allow frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));
app.use(express.json({ limit: "10mb" })); // Increase limit for base64 images

// connect MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send("Hello from the Backend server!");
});

// routes
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes); // ✅ now: /api/teachers, /api/teachers/add, /api/teachers/:id
app.use("/api/school", schoolRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/routines", routineRoutes);
app.use("/api/timetables", timetableRoutes);
app.use("/api/calendar", calendarRoutes); // Mount calendar routes
app.use("/api/exams", examRoutes); // Mount exam routes
app.use("/api/results", resultRoutes); // Mount result routes
app.use("/api/auth", authRoutes);    // /api/auth/register, /api/auth/login, etc.

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
