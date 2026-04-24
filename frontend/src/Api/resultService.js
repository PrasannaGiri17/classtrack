import axios from "axios";

const API_URL = "http://localhost:7000/api/results";

const getStudentResults = async (studentId, academicYear) => {
    const params = academicYear ? { params: { academicYear } } : {};
    const response = await axios.get(`${API_URL}/student/${studentId}`, params);
    return response.data;
};

const getResultsByGradeSectionTerm = async (gradeId, sectionName, term, academicYear) => {
    const params = {};
    if (gradeId) params.gradeId = gradeId;
    if (sectionName) params.sectionName = sectionName;
    if (term) params.term = term;
    if (academicYear) params.academicYear = academicYear;

    const response = await axios.get(API_URL, { params });
    return response.data;
};

const getAnalytics = async (academicYear, gradeId, sectionName, term) => {
    const params = { academicYear, gradeId, sectionName, term };
    const response = await axios.get(`${API_URL}/analytics`, { params });
    return response.data;
};

const resultService = {
    getStudentResults,
    getResultsByGradeSectionTerm,
    getAnalytics
};

export default resultService;
