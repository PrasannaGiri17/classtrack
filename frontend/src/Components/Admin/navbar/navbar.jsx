import React from 'react';
import './navbar.css';
import { MdDarkMode } from "react-icons/md";
import { CiLight } from "react-icons/ci";
import GSearchBar from '../../GlobalSearchbar/Gsearchbar';
import { IoIosNotifications } from "react-icons/io";
const Navbar = ({ pagename = "Dashboard" }) => {
  return (
    <div className="admin-navbar">
      <div className="left-content">
        <h2>{pagename}</h2>
    <h3>{new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).replace(/(\d+)/, (match) => {
      const day = parseInt(match);
      const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
      return day + suffix;
    })}</h3>
      </div>

      <div className="center-content">
        <GSearchBar />
      </div>

      <div className="right-content">
        {/* <div className="theme-toggle">
          <CiLight className="light-icon" />
          <MdDarkMode className="dark-icon" />
        </div> */}

        <div className="notification"><IoIosNotifications className="notification-icon" />  </div>
        


        <div className="profile">
          <img src="https://www.w3schools.com/howto/img_avatar.png" alt="profile" />
          <div className="profile-info">
            <div className="name">Admin</div>
            <div className="schoolname">Rosebud School</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
