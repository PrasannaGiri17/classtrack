import api from "../Utils/axiosInstance";

const API_URL = "/exams";

const getExamData = async (academicYear) => {
    const params = academicYear ? { academicYear } : {};
    const response = await api.get(API_URL, { params });
    return response.data;
};

const saveExamConfig = async (config) => {
    const response = await api.post(`${API_URL}/config`, config);
    return response.data;
};

const saveExamSchedule = async (scheduleData) => {
    const response = await api.post(`${API_URL}/schedule`, scheduleData);
    return response.data;
};

const updateTermStatus = async (term, isOpen, academicYear) => {
    const response = await api.patch(`${API_URL}/term-status`, { term, isOpen, academicYear });
    return response.data;
};

const updatePublishStatus = async (term, isPublished, academicYear) => {
    const response = await api.patch(`${API_URL}/publish-status`, { term, isPublished, academicYear });
    return response.data;
};

const examService = {
    getExamData,
    saveExamConfig,
    saveExamSchedule,
    updateTermStatus,
    updatePublishStatus
};

export default examService;

