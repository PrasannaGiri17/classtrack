import React, { useState, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Calendar as CalendarIcon,
    Info,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHolidayOnDate, getNepaliDateInfo } from '../Utils/nepaliDateHelpers';

const NEPALI_MONTHS = [
    "Baisakh", "Jestha", "Ashad", "Shrawan", "Bhadra", "Ashwin",
    "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const CustomNepaliHolidayCalendar = ({
    selectedDate = new Date(),
    onChange,
    holidays = [],
    className = "",
    showTodayButton = true,
    showTime = false
}) => {
    // Navigation state (AD month/year)
    const [viewDate, setViewDate] = useState(new Date(selectedDate));
    const [hoveredDate, setHoveredDate] = useState(null);

    // Time state
    const [tempTime, setTempTime] = useState(() => {
        const d = new Date(selectedDate);
        return {
            hours: d.getHours(),
            minutes: d.getMinutes() >= 30 ? 30 : 0
        };
    });

    const viewMonth = viewDate.getMonth();
    const viewYear = viewDate.getFullYear();

    // Calendar logic helpers
    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const startDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewYear, viewMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewYear, viewMonth + 1, 1));
    };

    const jumpToToday = () => {
        const today = new Date();
        setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
        if (onChange) onChange(today);
    };

    const handleDateSelect = (dateAD) => {
        const newDate = new Date(dateAD);
        if (showTime) {
            newDate.setHours(tempTime.hours, tempTime.minutes, 0, 0);
        }
        if (onChange) onChange(newDate);
    };

    const handleTimeSelect = (h, m) => {
        setTempTime({ hours: h, minutes: m });
        const newDate = new Date(selectedDate);
        newDate.setHours(h, m, 0, 0);
        if (onChange) onChange(newDate);
    };

    // Generate time slots (30 min intervals)
    const timeSlots = useMemo(() => {
        const slots = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 30) {
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 || 12;
                const timeStr = `${h12}:${m === 0 ? '00' : '30'} ${ampm}`;
                slots.push({ h, m, label: timeStr });
            }
        }
        return slots;
    }, []);

    // Calculate Nepali Month Range for Title
    const nepaliMonthInfo = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1);
        const lastDay = new Date(viewYear, viewMonth, daysInMonth(viewMonth, viewYear));

        const startInfo = getNepaliDateInfo(firstDay);
        const endInfo = getNepaliDateInfo(lastDay);

        const startMonth = NEPALI_MONTHS[startInfo.month - 1];
        const endMonth = NEPALI_MONTHS[endInfo.month - 1];

        return startMonth === endMonth ? startMonth : `${startMonth} - ${endMonth}`;
    }, [viewMonth, viewYear]);

    // Generate grid cells
    const calendarCells = useMemo(() => {
        const cells = [];
        const totalDays = daysInMonth(viewMonth, viewYear);
        const firstDay = startDayOfMonth(viewMonth, viewYear);

        // Padding for start of month
        for (let i = 0; i < firstDay; i++) {
            cells.push({ type: 'empty', key: `empty-${i}` });
        }

        // Actual days
        for (let day = 1; day <= totalDays; day++) {
            const dateAD = new Date(viewYear, viewMonth, day);
            const holiday = getHolidayOnDate(dateAD, holidays);
            const isSelected = selectedDate.toDateString() === dateAD.toDateString();
            const isToday = new Date().toDateString() === dateAD.toDateString();
            const nepaliInfo = getNepaliDateInfo(dateAD);

            cells.push({
                type: 'day',
                day,
                dateAD,
                holiday,
                isSelected,
                isToday,
                nepaliInfo,
                key: `day-${day}`
            });
        }

        return cells;
    }, [viewMonth, viewYear, selectedDate, holidays]);

    const monthName = viewDate.toLocaleString('default', { month: 'long' });

    return (
        <div className={`bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex ${showTime ? 'w-[480px]' : 'w-full'} ${className}`}>
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/10 dark:bg-slate-800/20">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                            <CalendarIcon size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                                {monthName} {viewYear}
                            </h3>
                            <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1.5">
                                {nepaliMonthInfo}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-emerald-500 shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {showTodayButton && (
                            <button
                                type="button"
                                onClick={jumpToToday}
                                className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-all border border-slate-100 dark:border-slate-800 hover:border-emerald-500/20 rounded-xl bg-white dark:bg-slate-900 shadow-sm"
                            >
                                Today
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-emerald-500 shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Weekdays Labels */}
                <div className="grid grid-cols-7 gap-1 px-5 py-3 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-50 dark:border-slate-800">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
                        <div key={day} className={`text-center text-[9px] font-black uppercase tracking-[0.2em] ${idx === 6 ? 'text-red-500' : 'text-slate-400'}`}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="p-5">
                    <div className="grid grid-cols-7 gap-2">
                        {calendarCells.map((cell) => {
                            if (cell.type === 'empty') return <div key={cell.key} className="h-10 w-10 sm:h-11 sm:w-11" />;

                            const { day, holiday, isSelected, isToday, dateAD, nepaliInfo } = cell;
                            const isWeekend = dateAD.getDay() === 6;

                            return (
                                <div
                                    key={cell.key}
                                    className="relative group flex justify-center"
                                    onMouseEnter={() => holiday && setHoveredDate(cell.key)}
                                    onMouseLeave={() => setHoveredDate(null)}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleDateSelect(dateAD)}
                                        className={`
                                            h-10 w-10 sm:h-11 sm:w-11 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative
                                            ${isSelected
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105 z-10'
                                                : holiday || isWeekend
                                                    ? 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'
                                                    : isToday
                                                        ? 'bg-slate-50 dark:bg-slate-800 ring-4 ring-emerald-500/10'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }
                                        `}
                                    >
                                        <span className={`text-sm font-black tracking-tighter ${isSelected ? 'text-white' : (holiday || isWeekend) ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
                                            }`}>
                                            {day}
                                        </span>
                                        <span className={`text-[8px] font-bold opacity-60 mt-0.5 ${isSelected ? 'text-emerald-100' : (holiday || isWeekend) ? 'text-red-400/60' : 'text-slate-400'}`}>
                                            {nepaliInfo.day}
                                        </span>
                                        {holiday && !isSelected && (
                                            <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-red-500 rounded-full shadow-sm" />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {holiday && hoveredDate === cell.key && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-40 px-3 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl pointer-events-none"
                                            >
                                                <div className="flex items-center gap-2 border-b border-white/10 dark:border-slate-100 pb-1.5 mb-1.5">
                                                    <Info size={10} className="text-emerald-400" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Holiday</span>
                                                </div>
                                                <p className="text-[10px] font-black leading-tight tracking-tight">
                                                    {holiday.holidayName || holiday.title}
                                                </p>
                                                <p className="text-[8px] font-bold opacity-60 mt-1.5 tracking-wider">
                                                    BS: {nepaliInfo.bsFull}
                                                </p>
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-slate-900 dark:border-t-white" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/10 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Today</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Holiday</span>
                        </div>
                    </div>

                    {showTime && (
                        <div className="relative group/time">
                            <select
                                value={`${tempTime.hours}-${tempTime.minutes}`}
                                onChange={(e) => {
                                    const [h, m] = e.target.value.split('-').map(Number);
                                    handleTimeSelect(h, m);
                                }}
                                className="appearance-none pl-8 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm cursor-pointer transition-all hover:border-emerald-500/30"
                            >
                                {timeSlots.map((slot) => (
                                    <option key={`${slot.h}-${slot.m}`} value={`${slot.h}-${slot.m}`} className="bg-white dark:bg-slate-900">
                                        {slot.label}
                                    </option>
                                ))}
                            </select>
                            <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover/time:text-emerald-500 transition-colors" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomNepaliHolidayCalendar;
