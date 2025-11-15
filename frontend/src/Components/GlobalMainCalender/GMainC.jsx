import React, { useState } from "react";
import "./GmainC.css";
import Gcalender from "../GlobalCalender/Gcalender";
import GcalenderDetail from "../GlobalCalenderDetail/Gcalenderdetail";

export const GMainC = () => {
  const [viewMode, setViewMode] = useState("calendar");

  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === "calendar" ? "detail" : "calendar");
  };

  return (
    <div className="gmain-box">
      <div className="header1" onClick={toggleViewMode}>
        <span className="header-text">
          {viewMode === "calendar" ? "Calendar" : "Detail"}
        </span>
        <span className="header-arrow">▶</span>
      </div> 
      
      <div className="gmain-content">
        {viewMode === "calendar" ? <Gcalender /> : <GcalenderDetail />}
      </div>
    </div>
  );
};

export default GMainC;