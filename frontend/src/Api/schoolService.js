import axios from "axios";

// Base URL configuration (adjust port if needed, assuming backend 7000 from index.js)
const API_URL = "http://localhost:7000/api/school";

const getSchool = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const addSchool = async (data) => {
  const response = await axios.post(`${API_URL}/add`, data);
  return response.data;
};

const updateSchool = async (data) => {
  const response = await axios.put(`${API_URL}/update`, data);
  return response.data;
};

const schoolService = {
  getSchool,
  addSchool,
  updateSchool,
};

export default schoolService;
