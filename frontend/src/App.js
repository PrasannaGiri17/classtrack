import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes,Navigate } from 'react-router-dom';
import { ActivePageProvider } from './context/ActivePageContext';
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
import PlaceholderPage from './Adminpages/PlaceholderPage';


import { GMainC } from './Components/GlobalMainCalender/GMainC';


import LoginPage from './Page/Users/LoginPage';
import ForgetPage from './Page/Users/ForgetPage';
import ResetPage from './Page/Users/ResetPage';
import ResetFirstLogin from './Page/Users/ResetFirstLogin';
import { ToastHost } from './MainSystemComponents/Toast';

function App() {
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
            <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="school" element={<SchoolManagement />} />
          <Route path="student-record" element={<StudentRecord />} />
          <Route path="teacher" element={<TeacherRecord />} />
          <Route path="timetable" element={<TimetablePage />} />
          <Route path="classroom" element={<ClassroomPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="notification" element={<NotificationPage />} />
          <Route path="exam" element={<ExamManagement />} />
        </Route>

            {/* ---------------- Public Website ---------------- */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
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