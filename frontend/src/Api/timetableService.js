import axios from "axios";

const API_URL = "http://localhost:7000/api/timetables";

const getTimetable = async (gradeNumber, sectionName, weekday, schoolId) => {
  const response = await axios.get(API_URL, {
    params: { gradeId: gradeNumber, sectionId: sectionName, weekday, schoolId }
  });
  return response.data;
};

const getTimetableOptions = async (gradeNumber, sectionName, weekday, schoolId) => {
  const response = await axios.get(`${API_URL}/options`, {
    params: { gradeNumber, sectionName, weekday, schoolId }
  });
  return response.data;
};

const updateTimetable = async (gradeNumber, sectionName, weekday, assignments, schoolId) => {
  const response = await axios.post(`${API_URL}/update`, {
    gradeNumber,
    sectionName,
    weekday,
    assignments,
    schoolId
  });
  return response.data;
};

const getTeacherRoutine = async (teacherId) => {
  const response = await axios.get(`${API_URL}/teacher/${teacherId}`);
  return response.data;
};

const updateTeacherTopic = async (teacherId, data) => {
  const response = await axios.post(`${API_URL}/teacher/${teacherId}/topic`, data);
  return response.data;
};

const clearAllTeachers = async (schoolId) => {
  const response = await axios.delete(`${API_URL}/clear-all-teachers`, {
    params: { schoolId }
  });
  return response.data;
};

const timetableService = {
  getTimetable,
  getTimetableOptions,
  getTeacherRoutine,
  updateTeacherTopic,
  updateTimetable,
  clearAllTeachers
};

export default timetableService;
