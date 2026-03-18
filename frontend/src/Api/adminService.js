import axios from "axios";

const API_URL = "http://localhost:7000/api/admins";

const getAllAdmins = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const getAdminById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

const addAdmin = async (adminData) => {
  const response = await axios.post(API_URL, adminData);
  return response.data;
};

const updateAdmin = async (id, adminData) => {
  const response = await axios.put(`${API_URL}/${id}`, adminData);
  return response.data;
};

const deleteAdmin = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

const adminService = {
  getAllAdmins,
  getAdminById,
  addAdmin,
  updateAdmin,
  deleteAdmin
};

export default adminService;
