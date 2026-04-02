// index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./database");

const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
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
const userRoutes = require("./routes/userRoutes");
const khaltiPaymentRoutes = require("./routes/khaltiPayment");
const esewaPaymentRoutes = require("./routes/esewaPayment");

const app = express();
const port = 7000;

// middlewares
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(express.static(__dirname));

// connect MongoDB
connectDB();

// ✅ Speed Logger Middleware — BEFORE routes
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 500) {
      console.log(`🐢 SLOW: ${req.method} ${req.url} — ${duration}ms`);
    } else {
      console.log(`✅ FAST: ${req.method} ${req.url} — ${duration}ms`);
    }
  });
  next();
});

app.get("/", (req, res) => {
  res.send("Hello from the Backend server!");
});

// routes
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/routines", routineRoutes);
app.use("/api/timetables", timetableRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/auth", authRoutes);
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
app.use("/api/users", userRoutes);
app.use("/api/payment/khalti", khaltiPaymentRoutes);
app.use("/api/payment/esewa", esewaPaymentRoutes);

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});