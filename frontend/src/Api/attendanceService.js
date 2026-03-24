import axios from "./axiosConfig";

const API_URL = "http://localhost:7000/api/attendance";

const getAttendance = async (sectionId, year, month) => {
  const response = await axios.get(API_URL, {
    params: { sectionId, year, month }
  });
  return response.data;
};

const saveAttendance = async (payload) => {
  const response = await axios.post(`${API_URL}/save`, payload);
  return response.data;
};

const getStudentMonthlyAttendance = async (studentId, year, month) => {
  const response = await axios.get(`${API_URL}/student/${studentId}/${year}/${month}`);
  return response.data;
};

const getStudentYearlyAttendance = async (studentId, year) => {
  const response = await axios.get(`${API_URL}/student/${studentId}/${year}`);
  return response.data;
};

const attendanceService = {
  getAttendance,
  saveAttendance,
  getStudentMonthlyAttendance,
  getStudentYearlyAttendance
};

export default attendanceService;
