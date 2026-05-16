import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes,Navigate } from 'react-router-dom';
import { ActivePageProvider } from './context/ActivePageContext';

import SuSchoolDetailPage from './SuperAdminpages/suSchoolDetailPage';
import SuSchoolsPage from './SuperAdminpages/suSchoolsPage';
import SuDashboard from './SuperAdminpages/suDashboard';
import SuAdminLayout from './SuperAdmincomponents/Layout/suAdminLayout';
import SuLoginPage from './SuperAdminpages/suLoginPage';
import SuMessagebot from './SuperAdminpages/SuMessagebot';


import AdminLayout from './AdminComponents/Layout/AdminLayout';
import DashboardPage from './Adminpages/Dashboard';
import CalendarPage from './Adminpages/CalendarPage';
import StudentRecord from './Adminpages/StudentRecord';
import TeacherRecord from './Adminpages/TeacherRecord';
import SchoolManagement from './Adminpages/SchoolManagement';
import TimetablePage from './Adminpages/TimetablePage';
import ClassroomPage from './Adminpages/ClassroomPage';
import NotificationPage from './Adminpages/NotificationPage';
import ExamManagement from './Adminpages/ExamManagement';
import Fee from './Adminpages/Fee';
import StudentFee from './Adminpages/StudentFee';
import PlaceholderPage from './Adminpages/PlaceholderPage';
import StudentPage from './Page/studentpage';
import AdminMePage from './Adminpages/AdminMePage';
import TeacherPage from './Page/teacherpage';
import MessagesPage from './Page/MessagesPage';
import ActivityPage from './Page/NotificationPage';


import TeacherLayout from './TeacherComponents/Layout/TecaherLayout';
import TeacherDashboard from './Teacherpages/tDashboard';
import RoutinePage from './Teacherpages/RoutinePage';
import AttendancePage from './Teacherpages/AttendancePage';
import TeacherStudentRecord from './Teacherpages/StudentRecord';
import TeacherCalendarPage from './Teacherpages/CalendarPage';
import TeacherExamManagement from './Teacherpages/SExamManagement';
import QuizPage from './Teacherpages/QuizPage';
import DiaryPage from './Teacherpages/DiaryPage';
import AssignmentsContent from './Teacherpages/AssignmentsContent';
import TeacherNotificationPage from './Teacherpages/NotificationPage';
import TeacherMePage from './Teacherpages/TeacherMePage';


import StudentLayout from './StudentComponents/Layout/StudentLayout'
import SDashboard from './Studentpages/sDashboard';
import SRoutinePage from './Studentpages/sRoutinePage';
import SStudentRecord from './Studentpages/sStudentRecord';
import SCalendarPage from './Studentpages/sCalendarPage';
import SExamManagement from './Studentpages/sExamManagement';
import SQuizPage from './Studentpages/sQuizPage';
import SDiaryPage from './Studentpages/sDiaryPage';
import SAssignmentsContent from './Studentpages/sAssignmentsContent';
import SNotificationPage from './Studentpages/sNotificationPage';
import SFeeManagement from './Studentpages/sFeeManagement';
import SDiscussionsPage from './Studentpages/sDiscussionsPage';
import StudentMePage from './Studentpages/StudentMePage';


import { GMainC } from './Components/GlobalMainCalender/GMainC';


import LoginPage from './Page/Users/LoginPage';
import ForgetPage from './Page/Users/ForgetPage';
import ResetPage from './Page/Users/ResetPage';
import ResetFirstLogin from './Page/Users/ResetFirstLogin';
import { ToastHost } from './MainSystemComponents/Toast';

import { useAuth } from './context/AuthContext';

function App() {
  const { token, user } = useAuth();

  const getRedirectPath = () => {
    if (token && user) {
      if (user.mustChangePassword) return <Navigate to="/reset-first-login" />;
      if (user.role === "admin") return <Navigate to="/admin/dashboard" />;
      if (user.role === "teacher") return <Navigate to="/teacher/dashboard" />;
      if (user.role === "student") return <Navigate to="/student/dashboard" />;
      if (user.role === "super-admin") return <Navigate to="/super-admin/dashboard" />;
    }
    return <LoginPage />;
  };

  return (
    <ActivePageProvider>
      <Router>
        <div className="App">
          <ToastHost />
          <Routes>

            
            {/* <Route path="/admin" element={<Alayout />}>
              
              <Route index element={<DashBoard />} />

     
              <Route path="dashboard" element={<DashBoard />} />
              <Route path="school" element={<School />} />
              <Route path="student-record" element={<StudentRecord />} />
              <Route path="teacher" element={<TeacherRecord />} />
              <Route path="timetable" element={<div>Timetable Page </div>} />
              <Route path="classroom" element={<div>Classroom Page</div>} />
              <Route path="calendar" element={<Gcalender />} />
              <Route path="exam" element={<div>Exam Page</div>} />
              <Route path="notification" element={<div>Notification Page</div>} />
              
             
              <Route path="gcalendar" element={<Gcalender />} />
              <Route path="gcalendar/:id" element={<GcalenderDetail />} />
            </Route>  */}
            <Route path="/super-admin/login" element={<SuLoginPage />} />

            <Route path="/super-admin" element={
              token && user && user.role === "super-admin"
                ? <SuAdminLayout />
                : <Navigate to="/super-admin/login" replace />
            }>

              <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
              <Route path="dashboard" element={<SuDashboard />} />
              <Route path="school" element={<SuSchoolsPage />} />
              <Route path="school/:id" element={<SuSchoolDetailPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="messagebot" element={<SuMessagebot />} />
            </Route>

            
            <Route path="/admin" element={
              token && user && user.role === "admin" && !user.mustChangePassword
                ? <AdminLayout />
                : (user?.mustChangePassword ? <Navigate to="/reset-first-login" replace /> : <Navigate to="/" replace />)
            }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="school" element={<SchoolManagement />} />
          <Route path="student-record" element={<StudentRecord />} />
          <Route path="teacher" element={<TeacherRecord />} />
          <Route path="timetable" element={<TimetablePage />} />
          <Route path="classroom" element={<ClassroomPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="notification" element={<NotificationPage />} />
          <Route path="exam" element={<ExamManagement />} />
          <Route path="fee" element={<Fee />} />
          <Route path="fee/student/:id" element={<StudentFee />} />
          <Route path="student/:id" element={<StudentPage />} />
          <Route path="teacher/:id" element={<TeacherPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="profile" element={<AdminMePage />} />
          <Route path="activities" element={<ActivityPage />} />
        </Route>

        <Route path="/teacher" element={
          token && user && user.role === "teacher" && !user.mustChangePassword
            ? <TeacherLayout />
            : (user?.mustChangePassword ? <Navigate to="/reset-first-login" replace /> : <Navigate to="/" replace />)
        }>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="routine" element={<RoutinePage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="student-record" element={<TeacherStudentRecord />} />
          <Route path="calendar" element={<TeacherCalendarPage />} />
          <Route path="exam" element={<TeacherExamManagement />} />
          <Route path="quiz" element={<QuizPage />} />
          <Route path="diary" element={<DiaryPage />} />
          <Route path="assignments" element={<AssignmentsContent />} />
          <Route path="notification" element={<TeacherNotificationPage />} />
          <Route path="discussions" element={<SDiscussionsPage />} />
          <Route path="profile" element={<TeacherMePage />} />
          <Route path="student-profile" element={<StudentMePage />} />
          <Route path="student/:id" element={<StudentPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="activities" element={<ActivityPage />} />
        </Route>

        <Route path="/student" element={
          token && user && user.role === "student" && !user.mustChangePassword
            ? <StudentLayout />
            : (user?.mustChangePassword ? <Navigate to="/reset-first-login" replace /> : <Navigate to="/" replace />)
        }>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<SDashboard />} />
          <Route path="routine" element={<SRoutinePage />} />
          <Route path="classroom" element={<SStudentRecord />} />
          <Route path="calendar" element={<SCalendarPage />} />
          <Route path="exam" element={<SExamManagement />} />
          <Route path="quiz" element={<SQuizPage />} />
          <Route path="diary" element={<SDiaryPage />} />
          <Route path="assignments" element={<SAssignmentsContent />} />
          <Route path="notification" element={<SNotificationPage />} />
          <Route path="fee" element={<SFeeManagement />} />
          <Route path="discussions" element={<SDiscussionsPage />} />
          <Route path="profile" element={<StudentMePage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="activities" element={<ActivityPage />} />
          
        </Route>

            {/* ---------------- Public Website ---------------- */}
            <Route path="/" element={getRedirectPath()} />
            <Route path="/login" element={getRedirectPath()} />
            <Route path="/forget" element={<ForgetPage />} />
            <Route path="/reset" element={<ResetPage />} />
            
            <Route path="/reset-first-login" element={<ResetFirstLogin />} />
            <Route path="/test" element={<GMainC />} />
          </Routes>
        </div>
      </Router>
    </ActivePageProvider>
  );
}

export default App;