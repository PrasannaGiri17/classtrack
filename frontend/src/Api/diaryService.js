import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api";

const getTeacherRoutine = async (teacherId, date) => {
    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];
    const response = await axios.get(`${API_BASE_URL}/teacher-routine/teacher/${teacherId}?date=${dateStr}`);
    return response.data;
};

const saveDiaryEntry = async (entryData) => {
    const response = await axios.post(`${API_BASE_URL}/diary/save`, entryData);
    return response.data;
};

const getDiariesForDate = async (teacherId, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const response = await axios.get(`${API_BASE_URL}/diary?teacherId=${teacherId}&date=${dateStr}`);
    return response.data;
};

const getDiariesByClass = async (className, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const response = await axios.get(`${API_BASE_URL}/diary/class?className=${className}&date=${dateStr}`);
    return response.data;
};

const diaryService = {
    getTeacherRoutine,
    saveDiaryEntry,
    getDiariesForDate,
    getDiariesByClass
};

export default diaryService;
