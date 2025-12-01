import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ActivePageProvider } from './context/ActivePageContext';
import Alayout from './Components/Admin/Layout/Alayout';
import Gcalender from './Components/GlobalCalender/Gcalender';
import GcalenderDetail from './Components/GlobalCalenderDetail/Gcalenderdetail';
import { GMainC } from './Components/GlobalMainCalender/GMainC';
import DashBoard from './Page/Admin/DashBoard';
import School from './Page/Admin/School';
import StudentRecord from './Page/Admin/StudentRecord';
import TeacherRecord from './Page/Admin/TeacherRecord';

function App() {
  return (
    <ActivePageProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* ---------------- Admin Pages (Wrapped in Layout) ---------------- */}
            <Route path="/admin" element={<Alayout />}>
              {/* Default admin home: /admin */}
              <Route index element={<DashBoard />} />

              {/* Admin pages that match sidebar routes */}
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
            </Route>

            {/* ---------------- Public Website ---------------- */}
            <Route path="/" element={<GMainC />} />
          </Routes>
        </div>
      </Router>
    </ActivePageProvider>
  );
}

export default App;