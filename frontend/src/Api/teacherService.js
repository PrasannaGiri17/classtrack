import axios from "axios";

const API_URL = "http://localhost:7000/api/teachers";

const getAllTeachers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const teacherService = {
  getAllTeachers
};

export default teacherService;
