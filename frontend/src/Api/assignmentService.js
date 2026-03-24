import axios from "./axiosConfig";

const API_URL = "http://localhost:7000/api/assignments";

const createAssignment = async (assignmentData) => {
  const response = await axios.post(`${API_URL}/create`, assignmentData);
  return response.data;
};

const getTeacherAssignments = async (teacherId) => {
  const response = await axios.get(`${API_URL}/teacher/${teacherId}`);
  return response.data;
};

const getAssignmentById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

const updateAssignment = async (id, assignmentData) => {
  const response = await axios.put(`${API_URL}/${id}`, assignmentData);
  return response.data;
};

const deleteAssignment = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

const toggleLock = async (id) => {
  const response = await axios.patch(`${API_URL}/${id}/toggle-lock`);
  return response.data;
};

const getReport = async (id) => {
  const response = await axios.get(`${API_URL}/${id}/report`);
  return response.data;
};

const gradeSubmission = async (id, submissionId, gradingStatus) => {
  const response = await axios.patch(`${API_URL}/${id}/submission/${submissionId}/grade`, { gradingStatus });
  return response.data;
};

const updateRemark = async (id, submissionId, remark) => {
  const response = await axios.patch(`${API_URL}/${id}/submission/${submissionId}/remark`, { remark });
  return response.data;
};

const getStudentAssignments = async (grade, section, studentId) => {
  const url = studentId 
    ? `${API_URL}/student/${grade}/${section}?studentId=${studentId}`
    : `${API_URL}/student/${grade}/${section}`;
  const response = await axios.get(url);
  return response.data;
};

const submitAssignment = async (id, submissionData) => {
  const response = await axios.post(`${API_URL}/${id}/submit`, submissionData);
  return response.data;
};

const assignmentService = {
  createAssignment,
  getTeacherAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  toggleLock,
  getReport,
  gradeSubmission,
  updateRemark,
  getStudentAssignments,
  submitAssignment
};

export default assignmentService;
