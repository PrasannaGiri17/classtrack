import axios from "./axiosConfig";

// Base URL configuration
const API_URL = "http://localhost:7000/api/grades";

const getGrades = async (schoolId) => {
  const response = await axios.get(API_URL, { params: { schoolId } });
  return response.data;
};

const updateGradeSections = async (gradeNumber, sectionCount, schoolId) => {
  const response = await axios.post(`${API_URL}/update-sections`, {
    gradeNumber,
    sectionCount,
    schoolId
  });
  return response.data;
};

const syncSections = async (sectionCount, gradeList = [], schoolId) => {
  const response = await axios.post(`${API_URL}/sync-sections`, {
    sectionCount,
    gradeList,
    schoolId
  });
  return response.data;
};

const updateSectionName = async (payload) => {
  const response = await axios.post(`${API_URL}/update-section-name`, payload);
  return response.data;
};

const updateGradeFee = async (gradeNumber, monthlyFee, schoolId) => {
  const response = await axios.post(`${API_URL}/update-fee`, {
    gradeNumber,
    monthlyFee,
    schoolId
  });
  return response.data;
};

const assignClassTeacher = async (payload) => {
  const response = await axios.post(`${API_URL}/assign-class-teacher`, payload);
  return response.data;
};

const getSectionByTeacherId = async (teacherId) => {
  const response = await axios.get(`${API_URL}/teacher/${teacherId}`);
  return response.data;
};

const getSectionById = async (sectionId) => {
  const response = await axios.get(`${API_URL}/section/${sectionId}`);
  return response.data;
};

const assignClassMonitor = async (payload) => {
  const response = await axios.post(`${API_URL}/assign-monitor`, payload);
  return response.data;
};

const gradeService = {
  getGrades,
  updateGradeSections,
  syncSections,
  updateSectionName,
  assignClassTeacher,
  assignClassMonitor,
  updateGradeFee,
  getSectionByTeacherId,
  getSectionById
};

export default gradeService;
