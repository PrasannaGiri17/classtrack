import axios from "axios";

const API_URL = "http://localhost:7000/api/exams";

const getExamData = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const updateTermStatus = async (term, isOpen) => {
    const response = await axios.patch(`${API_URL}/term-status`, { term, isOpen });
    return response.data;
};

const updatePublishStatus = async (term, isPublished) => {
    const response = await axios.patch(`${API_URL}/publish-status`, { term, isPublished });
    return response.data;
};

const examService = {
    getExamData,
    updateTermStatus,
    updatePublishStatus
};

export default examService;
