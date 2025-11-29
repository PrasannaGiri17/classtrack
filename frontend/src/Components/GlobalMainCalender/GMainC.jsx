import React, { useState } from "react";
import Gcalender from "../GlobalCalender/Gcalender";
import GcalenderDetail from "../GlobalCalenderDetail/Gcalenderdetail";

export const GMainC = () => {
  const [viewMode, setViewMode] = useState("calendar");

  const toggleView = () => {
    setViewMode(prev => (prev === "calendar" ? "detail" : "calendar"));
  };

  return (
    <div className="w-[340px] h-[480px] mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">

      {/* HEADER */}
      <div 
        className="flex justify-between items-center bg-white cursor-pointer text-xl font-semibold px-4 py-3 h-14"
        onClick={toggleView}
      >
        <div className="text-lg font-semibold">
          {viewMode === "calendar" ? "Calendar" : "Details"}
        </div>

        {/* FIXED VERTICAL CENTERED MENU ICON */}
        <div className="flex items-center justify-center text-xl text-gray-600 cursor-pointer h-full px-2 hover:bg-gray-100 rounded-md">
          ...
        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-white m-0 p-0 leading-none">
        <div className="m-0 p-0">
          {viewMode === "calendar" && <Gcalender />}
          {viewMode === "detail" && <GcalenderDetail />}
        </div>
      </div>

    </div>
  );
};

export default GMainC;
