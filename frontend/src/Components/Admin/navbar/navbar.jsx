import React from 'react';
import { MdDarkMode } from "react-icons/md";
import { CiLight } from "react-icons/ci";
import GSearchBar from '../../GlobalSearchbar/Gsearchbar';
import { IoIosNotifications } from "react-icons/io";

const Navbar = ({ activePage }) => {
  // Map page keys to display names
  const getPageDisplayName = () => {
    const pageNames = {
      dashboard: 'Dashboard',
      school: 'School Management',
      student: 'Student Records',
      teacher: 'Teacher Management',
      timetable: 'Timetable',
      classroom: 'Classroom',
      calendar: 'Calendar',
      exam: 'Examination',
      notification: 'Notifications'
    };
    return pageNames[activePage] || 'Dashboard';
  };

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).replace(/(\d+)/, (match) => {
    const day = parseInt(match);
    const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
    return day + suffix;
  });

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 bg-white rounded-md h-[8vh] relative">
      {/* Left Content */}
      <div className="flex flex-col">
        <h2 className="text-xl font-semibold text-gray-900">{getPageDisplayName()}</h2>
        <h3 className="text-sm font-normal text-gray-600">{formattedDate}</h3>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex justify-center">
        <GSearchBar />
      </div>

      {/* Right Content */}
      <div className="flex items-center gap-5">
        {/* Theme Toggle (commented out) */}
        {/* <div className="flex items-center gap-2 bg-gray-200 px-3 py-1.5 rounded-full">
          <CiLight className="text-lg cursor-pointer" />
          <MdDarkMode className="text-lg cursor-pointer" />
        </div> */}

        {/* Notification */}
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
          <IoIosNotifications className="text-xl text-gray-700" />
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2.5 bg-gray-200 px-3 py-1.5 rounded-full">
          <img 
            src="https://www.w3schools.com/howto/img_avatar.png" 
            alt="profile" 
            className="w-9 h-9 rounded-full"
          />
          <div className="flex flex-col">
            <div className="text-sm font-semibold text-gray-900">Admin</div>
            <div className="text-xs font-normal text-gray-600">Rosebud School</div>
          </div>
        </div>
      </div>

      {/* Custom Border - Middle Section Only */}
      <div className="absolute bottom-0 left-10 right-10 h-[2px] bg-[linear-gradient(to_right,transparent,#22c55e,#22c55e,#22c55e,transparent)]"></div>
    </div>
  );
};

export default Navbar;