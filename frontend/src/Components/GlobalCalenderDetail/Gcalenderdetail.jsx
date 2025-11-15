import React, { useState } from "react";
import "./Gcalenderdetail.css";

const GcalenderDetail = () => {
  const info = {
    november: {
      importantDays: [
        { day: 5, label: "Sports Day", type: "event", description: "Sport activity" },
        { day: 12, label: "Holiday", type: "holiday", description: "Public holiday" },
        { day: 23, label: "Parents Meeting", type: "event", description: "Parent meeting very important" },
        { day: 30, label: "Project Submission", type: "event", description: "Submit science project" }

      ],
      exam: {
        start: 18,
        end: 25,
        label: "Mid-Term Exam"
      }
    },
    december: {
      importantDays: [
        { day: 1, label: "Annual Day", type: "event", description: "School annual day" },
        { day: 25, label: "Christmas", type: "holiday", description: "Merry Christmas" },
        { day: 31, label: "New Year Eve", type: "event", description: "Happy new year" }
      ],
      exam: {
        start: 10,
        end: 20,
        label: "Final Exam"
      }
    },
    january: {
      importantDays: [
        { day: 15, label: "Republic Day", type: "holiday", description: "National holiday" },
        { day: 20, label: "Teacher Meet", type: "event", description: "Teacher parent meeting" }
      ]
    },
    april: {
      importantDays: [
        { day: 1, label: "Teacher Meet", type: "event", description: "Class teacher meeting" },
        { day: 1, label: "Holiday", type: "holiday", description: "Eid holiday" }
      ],
      exam: {
        start: 1,
        end: 9,
        label: "Final Exams"
      }
    }
  };

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" }).toLowerCase();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getAllEvents = () => {
    const events = [];
    const monthData = info[monthName];

    if (monthData?.importantDays) {
      monthData.importantDays.forEach((event) => {
        events.push({
          ...event,
          dateRange: `${String(event.day).padStart(2, "0")}`
        });
      });
    }

    if (monthData?.exam) {
      events.push({
        label: monthData.exam.label,
        type: "exam",
        dateRange: `${String(monthData.exam.start).padStart(2, "0")}-${String(monthData.exam.end).padStart(2, "0")}`,
        description: "Examination period"
      });
    }

    return events;
  };

  const events = getAllEvents();

  return (
    <div className="calendar-detail">

      {/* Header now matches Gcalender */}
      <div className="detail-header">
        <button onClick={prevMonth} className="nav-button-detail">◀</button>

        <h3 className="month-display">
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h3>

        <button onClick={nextMonth} className="nav-button-detail">▶</button>
      </div>

      <div className="events-list">
        {events.length > 0 ? (
          events.map((event, index) => (
            <div key={index} className={`event-item event-${event.type}`}>
              <div className={`event-date event-date-${event.type}`}>
                {event.dateRange}
              </div>
              <div className="event-content">
                <h3 className="event-label">{event.label}</h3>
                <p className="event-description">{event.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-events">No events this month</p>
        )}
      </div>
    </div>
  );
};

export default GcalenderDetail;
