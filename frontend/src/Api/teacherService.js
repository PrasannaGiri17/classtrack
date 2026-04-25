import axios from "./axiosConfig";

const API_URL = "http://localhost:7000/api/teachers";

const getAllTeachers = async (schoolId) => {
  const url = schoolId ? `${API_URL}?schoolId=${schoolId}` : API_URL;
  const response = await axios.get(url);
  return response.data;
};

const getTeacherById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

const addTeacher = async (teacherData) => {
  const response = await axios.post(`${API_URL}/add`, teacherData);
  return response.data;
};

const updateTeacher = async (id, teacherData) => {
  const response = await axios.put(`${API_URL}/${id}`, teacherData);
  return response.data;
};

const deleteTeacher = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

const teacherService = {
  getAllTeachers,
  getTeacherById,
  addTeacher,
  updateTeacher,
  deleteTeacher
};

export default teacherService;
