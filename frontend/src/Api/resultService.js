import axios from "axios";

const API_URL = "http://localhost:7000/api/results";

const getStudentResults = async (studentId) => {
    const response = await axios.get(`${API_URL}/student/${studentId}`);
    return response.data;
};

const getResultsByGradeSectionTerm = async (gradeId, sectionName, term) => {
    const params = { gradeId, sectionName, term };
    const response = await axios.get(API_URL, { params });
    return response.data;
};

const resultService = {
    getStudentResults,
    getResultsByGradeSectionTerm
};

export default resultService;

