import axios from "./axiosConfig";

const API_URL = "http://localhost:7000/api/students";

const getStudents = async (grade) => {
  const params = {};
  if (grade) params.studentClass = grade;
  const response = await axios.get(API_URL, { params });
  return response.data;
};

const getStudentsBySection = async (studentClass, sectionId) => {
  const params = { studentClass, sectionId };
  const response = await axios.get(API_URL, { params });
  return response.data;
};

const getStudentsByClassTeacher = async (teacherId) => {
  const response = await axios.get(API_URL, { params: { classTeacherId: teacherId } });
  return response.data;
};

const bulkEnrollment = async (studentIds, sectionId, studentClass) => {
  const response = await axios.post(`${API_URL}/bulk-enrollment`, { studentIds, sectionId, studentClass });
  return response.data;
};

const removeFromSection = async (studentId) => {
  const response = await axios.post(`${API_URL}/remove-from-section`, { studentId });
  return response.data;
};

const getStudentById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

const addStudent = async (studentData) => {
  const response = await axios.post(`${API_URL}/add`, studentData);
  return response.data;
};

const updateStudent = async (id, studentData) => {
  const response = await axios.put(`${API_URL}/${id}`, studentData);
  return response.data;
};

const deleteStudent = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

const togglePin = async (id) => {
  const response = await axios.patch(`${API_URL}/${id}/toggle-pin`);
  return response.data;
};

const studentService = {
  getStudents,
  getStudentsBySection,
  getStudentsByClassTeacher,
  bulkEnrollment,
  removeFromSection,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent,
  togglePin
};

export default studentService;

