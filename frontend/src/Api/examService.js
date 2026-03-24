import axios from "axios";

const API_URL = "http://localhost:7000/api/exams";

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

const getExamData = async () => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
};

const saveExamConfig = async (config) => {
    const response = await axios.post(`${API_URL}/config`, config, getAuthHeaders());
    return response.data;
};

const saveExamSchedule = async (scheduleData) => {
    const response = await axios.post(`${API_URL}/schedule`, scheduleData, getAuthHeaders());
    return response.data;
};

const updateTermStatus = async (term, isOpen) => {
    const response = await axios.patch(`${API_URL}/term-status`, { term, isOpen }, getAuthHeaders());
    return response.data;
};

const updatePublishStatus = async (term, isPublished) => {
    const response = await axios.patch(`${API_URL}/publish-status`, { term, isPublished }, getAuthHeaders());
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

