import React, { useState } from "react";
import "./Gcalender.css";

const Gcalender = () => {

  const info = {
    november: {
      importantDays: [
        { day: 5, label: "Sports Day", type: "event" },
        { day: 12, label: "Holiday", type: "holiday" },
        { day: 23, label: "Parents Meeting", type: "event" }
      ],
      exam: {
        start: 18,
        end: 25,
        label: "Mid-Term Exam"
      }
    },
    december: {
      importantDays: [
        { day: 1, label: "Annual Day", type: "event" },
        { day: 25, label: "Christmas", type: "holiday" },
        { day: 31, label: "New Year Eve", type: "event" }
      ]
    }
  };

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" }).toLowerCase();

  const firstDay = new Date(year, month, 1).getDay(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push("");
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getImportantDayType = (day) => {
    const importantDay = info[monthName]?.importantDays?.find((d) => d.day === day);
    return importantDay ? importantDay.type : null;
  };

  const isImportantDay = (day) =>
    info[monthName]?.importantDays?.some((d) => d.day === day) || false;

  const isExamDay = (day) =>
    info[monthName]?.exam && day >= info[monthName].exam.start && day <= info[monthName].exam.end;

  const isSaturday = (index) => {
    if (!days[index]) return false;
    const columnIndex = index % 7;
    return columnIndex === 6;
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-button">◀</button>
        <h3>
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h3>
        <button onClick={nextMonth} className="nav-button">▶</button>
      </div>

      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div className="day-name" key={d}>{d}</div>
        ))}

        {days.map((d, i) => (
          <div
            key={i}
            className={`day 
              ${d ? "number" : "empty"} 
              ${isImportantDay(d) ? getImportantDayType(d) : ""} 
              ${isExamDay(d) ? "exam" : ""}
              ${isSaturday(i) ? "saturday" : ""}
              ${d && !isImportantDay(d) && !isExamDay(d) && !isSaturday(i) ? "normal" : ""}
            `}
          >
            <div className="day-content">
              {d}
              {d && (
                <span className={`indicator ${
                  isImportantDay(d) ? getImportantDayType(d) + "-dot" : 
                  isExamDay(d) ? "exam-dot" : 
                  isSaturday(i) ? "holiday-dot" : 
                  "normal-dot"
                }`}></span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gcalender;