import React from 'react';
import GMainC from '../../Components/GlobalMainCalender/GMainC';
import BoxNumber from '../../Components/SmallerComponents/boxNumber';
import Percentage from '../../Components/SmallerComponents/Percentage';
import Gender from '../../Components/SmallerComponents/gender';

const DashBoard = () => {
  const info = {
    student: {
      title: 'Total Students',
      number: 1200,
    },
    teacher: {
      title: 'Total Teachers',
      number: 75,
    },
    classroom: {
      title: 'Total Classrooms',
      number: 40,
    },
    subjects: {
      title: 'Total Subjects',
      number: 25,
    },
  };

  return (
    <div className="space-y-4">
      {/* Box 1 */}
      <div className="flex gap-[0.001rem]"> 
        {/* Left Side */}
        <div className="flex-1 bg-gray-50 p-4 flex flex-col gap-4 m-1">
          {/* BoxNumber Components - Top */}
          <div className="flex gap-4">
            <BoxNumber info={info.student} />
            <BoxNumber info={info.teacher} />
            <BoxNumber info={info.classroom} />
          </div>
          
          {/* Percentage and Gender - Side by Side Below */}
          <div className="flex gap-1  flex-1">
            <div className="flex-1">
              <Gender />
            </div>
            <div className="flex-1">
              <Percentage />
            </div>
          </div>
        </div>

        {/* Right Side - Calendar */}
        <div className="flex-1 bg-gray-50 p-4 flex items-stretch">
          <div className="w-full">
            <GMainC />
          </div>
        </div>
      </div>

      {/* Box 2 */}
      <div className="flex gap-4">
        <div className="flex-1 bg-gray-50 p-4">
          {/* Box 2 Left */}
        </div>
        <div className="flex-1 bg-gray-50 p-4">
          {/* Box 2 Right */}
        </div>
      </div>
    </div>
  );
};

export default DashBoard;