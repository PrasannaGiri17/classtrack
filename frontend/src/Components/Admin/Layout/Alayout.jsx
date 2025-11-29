import React, { useState } from 'react';
import Navbar from '../navbar/navbar';
import Sidebar from '../sidebar/sidebar';
import { Outlet } from 'react-router-dom';

const Alayout = () => {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Sidebar - Fixed Left */}
      <aside className="fixed left-0 top-0 bottom-0 w-[250px] bg-white">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
      </aside>

      {/* Main Section - Right of Sidebar */}
      <div className="ml-[250px] w-[calc(100%-250px)] flex flex-col h-screen">
        {/* Navbar */}
        <nav className="sticky top-0 z-10 h-[70px] bg-white flex items-center">
          <Navbar activePage={activePage} />
        </nav>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 p-5 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Alayout;