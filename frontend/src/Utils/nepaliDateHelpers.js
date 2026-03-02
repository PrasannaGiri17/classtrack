import { convertADtoBS, convertBStoAD } from "@adhikarisaroj795/nepali-calendar-react";

/**
 * Normalizes a date string or object to YYYY-MM-DD
 * @param {Date|string} date 
 * @returns {string}
 */
export const formatDateAD = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Checks if a given AD date is a holiday mapping from a list
 * @param {Date|string} dateAD 
 * @param {Array} holidayList 
 * @returns {Object|null}
 */
export const getHolidayOnDate = (dateAD, holidayList) => {
    if (!holidayList || !Array.isArray(holidayList)) return null;
    const adStr = formatDateAD(dateAD);
    
    return holidayList.find(holiday => {
        // 1. Check direct dateStr (Reliable YYYY-MM-DD from backend)
        if (holiday.dateStr === adStr) return true;

        // 2. Check gregorian_date (direct from DB if available)
        if (holiday.gregorian_date === adStr) return true;
        
        // 3. Check startDate (Mapped in calendarController - Fallback)
        if (holiday.startDate) {
            const holidayADStr = formatDateAD(holiday.startDate);
            if (holidayADStr === adStr) return true;
        }

        // 4. Check bsDate (Local fallback format)
        if (holiday.bsDate) {
            try {
                const convertedAD = convertBStoAD(holiday.bsDate.replace(/\//g, '-'));
                return convertedAD === adStr;
            } catch (e) {
                return false;
            }
        }
        
        return false;
    });
};

/**
 * Gets Nepali date info for a Gregorian date
 * @param {Date|string} dateAD 
 * @returns {Object}
 */
export const getNepaliDateInfo = (dateAD) => {
    try {
        const adStr = formatDateAD(dateAD);
        const bsStr = convertADtoBS(adStr); // returns "YYYY-MM-DD"
        const [year, month, day] = bsStr.split('-').map(Number);
        
        return {
            bsFull: bsStr,
            year,
            month,
            day
        };
    } catch (e) {
        return { bsFull: "", year: 0, month: 0, day: 0 };
    }
};
