import React from 'react';
import { PiStudent } from "react-icons/pi";
import { GiTeacher } from "react-icons/gi";
import { FaDoorOpen } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";

const BoxNumber = ({ info }) => {
  const iconMap = {
    student: PiStudent,
    teacher: GiTeacher,
    classroom: FaDoorOpen,
    subject: FaBookOpen,
  };

  // Determine which icon to use based on title
  const getIconComponent = () => {
    const title = info.title.toLowerCase();
    if (title.includes('student')) return iconMap.student;
    if (title.includes('teacher')) return iconMap.teacher;
    if (title.includes('classroom')) return iconMap.classroom;
    if (title.includes('subject')) return iconMap.subject;
    return iconMap.student; // default icon
  };

  const IconComponent = getIconComponent();
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-start gap-4 min-w-[240px] h-[100px] ">
      <div className="text-teal-500 text-4xl">
        <IconComponent />
      </div>
      <div className="flex flex-col">
        <div className="text-4xl font-bold text-gray-900">{info.number}</div>
        <div className="text-sm text-gray-500 uppercase tracking-wide mt-1">
          {info.title}
        </div>
      </div>
    </div>
  );
};

export default BoxNumber;