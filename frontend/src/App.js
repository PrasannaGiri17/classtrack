import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Alayout from './Components/Admin/Layout/Alayout';
import Gcalender from './Components/GlobalCalender/Gcalender';
import GcalenderDetail from './Components/GlobalCalenderDetail/Gcalenderdetail';
import { GMainC } from './Components/GlobalMainCalender/GMainC';
import DashBoard from './Page/Admin/Dashboard/DashBoard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>

          {/* ---------------- Admin Pages (Wrapped in Layout) ---------------- */}
          <Route path="/admin" element={<Alayout />}>
            {/* Default admin home: /admin */}
            <Route index element={<DashBoard />} />

            {/* or other admin pages */}
            <Route path="dashboard" element={<DashBoard />} />
            <Route path="gcalendar" element={<Gcalender />} />
            <Route path="gcalendar/:id" element={<GcalenderDetail />} />
          </Route>

          {/* ---------------- Public Website ---------------- */}
          <Route path="/" element={<GMainC />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
