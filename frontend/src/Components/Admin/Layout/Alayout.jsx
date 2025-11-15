import React from 'react';
import './Alayout.css';
import Navbar from '../navbar/navbar';
import Sidebar from '../sidebar/sidebar';
import { Outlet } from 'react-router-dom';

const Alayout = () => {
  return (
    <div className="a-layout-container">
      <aside className="a-sidebar">
        <Sidebar />
      </aside>

      <div className="a-main-section">
        <nav className="a-navbar">
          <Navbar />
        </nav>

        <main className="a-content">
          <Outlet />   {/* CHILD ROUTES RENDER HERE */}
        </main>
      </div>
    </div>
  );
};

export default Alayout;