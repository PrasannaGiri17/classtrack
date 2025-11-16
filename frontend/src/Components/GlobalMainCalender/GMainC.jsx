import React, { useState } from "react";
import "./Gmainc.css";
import Gcalender from "../GlobalCalender/Gcalender";
import GcalenderDetail from "../GlobalCalenderDetail/Gcalenderdetail";

export const GMainC = () => {
  const [viewMode, setViewMode] = useState("calendar");

  const toggleView = () => {
    setViewMode(prev => (prev === "calendar" ? "detail" : "calendar"));
  };

  return (
    <div className="gmain-box">
      
      {/* HEADER TOGGLE */}
      <div className="header" onClick={toggleView}>
        <div className="tab-text">
          {viewMode === "calendar" ? "Calendar" : "Details"}
        </div>
        <div className="arrow">...</div>
      </div>

      {/* CONTENT */}
      <div className="gmain-content">
        {viewMode === "calendar" && <Gcalender />}
        {viewMode === "detail" && <GcalenderDetail />}
      </div>

    </div>
  );
};

export default GMainC;
