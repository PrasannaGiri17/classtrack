import axios from "axios";

const API_URL = "http://localhost:7000/api/timetables";

const getTimetable = async (gradeNumber, sectionName) => {
  const response = await axios.get(API_URL, {
    params: { gradeNumber, sectionName }
  });
  return response.data;
};

const getTimetableOptions = async (gradeNumber) => {
  const response = await axios.get(`${API_URL}/options`, {
    params: { gradeNumber }
  });
  return response.data;
};

const updateTimetable = async (gradeNumber, sectionName, assignments) => {
  const response = await axios.post(`${API_URL}/update`, {
    gradeNumber,
    sectionName,
    assignments
  });
  return response.data;
};

const timetableService = {
  getTimetable,
  getTimetableOptions,
  updateTimetable
};

export default timetableService;
