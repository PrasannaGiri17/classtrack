import React, { useState } from 'react';
import CustomNepaliHolidayCalendar from '../MainSystemComponents/CustomNepaliHolidayCalendar';
import sampleHolidays from '../Data/holidays';

const CalendarDemoPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleDateChange = (date) => {
        setSelectedDate(date);
        console.log("Selected Date (AD):", date);
    };

    return (
        <div className="p-10 bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col items-center justify-center space-y-10">
            <div className="max-w-md w-full">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6 text-center uppercase tracking-tight">
                    Custom Nepali Holiday Calendar
                </h1>

                <CustomNepaliHolidayCalendar
                    selectedDate={selectedDate}
                    onChange={handleDateChange}
                    holidays={sampleHolidays}
                    showTodayButton={true}
                />

                <div className="mt-8 bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selection Status</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">
                        {selectedDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CalendarDemoPage;
