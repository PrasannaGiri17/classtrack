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
const notificationRoutes = require("./routes/notificationRoutes");
const classroomNoticeRoutes = require("./routes/classroomNoticeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const quizRoutes = require("./routes/quizRoutes");
const teacherRoutineRoutes = require("./routes/teacherRoutineRoutes");
const diaryRoutes = require("./routes/diaryRoutes");
const assignmentRoutes = require("./routes/assignment.routes");
const contentRoutes = require("./routes/content.routes");
const studentQuizRoutes = require("./routes/studentQuizRoutes");
const studentFeeRoutes = require("./routes/studentFeeRoutes");
const feeRoutes = require("./routes/feeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const statsRoutes = require("./routes/statsRoutes");
const superAdminAuthRoutes = require("./routes/superAdminAuthRoutes");
const discussionRoutes = require("./routes/discussionRoutes");



const app = express();
const port = 7000;

// middlewares
// middlewares
app.use(cors({
  origin: "http://localhost:3000", // Allow frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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
app.use("/api/notifications", notificationRoutes);
app.use("/api/classroom-notices", classroomNoticeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/teacher-routine", teacherRoutineRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/student/quiz", studentQuizRoutes);
app.use("/api/fees", studentFeeRoutes);
app.use("/api/fee-records", feeRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/superadmin", superAdminAuthRoutes);
app.use("/api/discussions", discussionRoutes);


app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
