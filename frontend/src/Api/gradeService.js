import axios from "axios";

// Base URL configuration
const API_URL = "http://localhost:7000/api/grades";

const getGrades = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const updateGradeSections = async (gradeNumber, sectionCount) => {
  const response = await axios.post(`${API_URL}/update-sections`, {
    gradeNumber,
    sectionCount
  });
  return response.data;
};

const syncSections = async (sectionCount, gradeList = []) => {
  const response = await axios.post(`${API_URL}/sync-sections`, {
    sectionCount,
    gradeList
  });
  return response.data;
};

const updateSectionName = async (payload) => {
  const response = await axios.post(`${API_URL}/update-section-name`, payload);
  return response.data;
};

const updateGradeFee = async (gradeNumber, monthlyFee) => {
  const response = await axios.post(`${API_URL}/update-fee`, {
    gradeNumber,
    monthlyFee
  });
  return response.data;
};

const assignClassTeacher = async (payload) => {
  const response = await axios.post(`${API_URL}/assign-class-teacher`, payload);
  return response.data;
};

const gradeService = {
  getGrades,
  updateGradeSections,
  syncSections,
  updateSectionName,
  assignClassTeacher,
  updateGradeFee
};

export default gradeService;
