import React from 'react'
import './sidebar.css'

import reallogo from '../../../Assests/Real_Madrid_CF.svg.png';
import { MdOutlineDashboard } from "react-icons/md"
import { FaSchool } from "react-icons/fa"
import { FaChalkboardTeacher } from "react-icons/fa"
import { PiStudent } from "react-icons/pi"
import { MdOutlineMoreTime } from "react-icons/md"
import { SiGoogleclassroom } from "react-icons/si"
import { PiExam } from "react-icons/pi"
import { IoCalendarOutline } from "react-icons/io5"
import { IoIosNotificationsOutline } from "react-icons/io"
import { MdExitToApp } from "react-icons/md"

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-container">
          {/* Using a placeholder logo since the asset path was incorrect */}
          <img src={reallogo} alt="Real Madrid Logo" className="sidebar-logo-image" />
          <h1 className="sidebar-title">Real Madrid</h1>
        </div>
      </div>

      <div className="sidebar-menu-section">
        <p className="sidebar-menu-label">Menu</p>
        <div className="sidebar-menu-items">
          <div className="sidebar-item">
            <MdOutlineDashboard className="sidebar-item-icon" />
            <span>Dashboard</span>
          </div>
          <div className="sidebar-item">
            <FaSchool className="sidebar-item-icon" />
            <span>School</span>
          </div>
          <div className="sidebar-item">
            <PiStudent className="sidebar-item-icon" />
            <span>Student Record</span>
          </div>
          <div className="sidebar-item">
            <FaChalkboardTeacher className="sidebar-item-icon" />
            <span>Teacher</span>
          </div>
          <div className="sidebar-item">
            <MdOutlineMoreTime className="sidebar-item-icon" />
            <span>Timetable</span>
          </div>
          <div className="sidebar-item">
            <SiGoogleclassroom className="sidebar-item-icon" />
            <span>Classroom</span>
          </div>
          <div className="sidebar-item">
            <IoCalendarOutline className="sidebar-item-icon" />
            <span>Calendar</span>
          </div>
          <div className="sidebar-item">
            <PiExam className="sidebar-item-icon" />
            <span>Exam</span>
          </div>
          <div className="sidebar-item">
            <IoIosNotificationsOutline className="sidebar-item-icon" />
            <span>Notification</span>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-item sidebar-exit-item">
          <MdExitToApp className="sidebar-item-icon" />
          <span>Exit</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
