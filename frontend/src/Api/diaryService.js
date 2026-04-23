import axiosConfig from "./axiosConfig";

const API_BASE_URL = "http://localhost:7000/api";

const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getTeacherRoutine = async (teacherId, date) => {
    const dateStr = formatDateLocal(date);
    const response = await axiosConfig.get(`${API_BASE_URL}/teacher-routine/teacher/${teacherId}?date=${dateStr}`);
    return response.data;
};

const saveDiaryEntry = async (entryData) => {
    const response = await axiosConfig.post(`${API_BASE_URL}/diary/save`, entryData);
    return response.data;
};

const getDiariesForDate = async (teacherId, date) => {
    const dateStr = formatDateLocal(date);
    const response = await axiosConfig.get(`${API_BASE_URL}/diary?teacherId=${teacherId}&date=${dateStr}`);
    return response.data;
};

const getDiariesByClass = async (className, date) => {
    const dateStr = formatDateLocal(date);
    const response = await axiosConfig.get(`${API_BASE_URL}/diary/class?className=${encodeURIComponent(className)}&date=${dateStr}`);
    return response.data;
};

const diaryService = {
    getTeacherRoutine,
    saveDiaryEntry,
    getDiariesForDate,
    getDiariesByClass
};

export default diaryService;
