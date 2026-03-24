import axios from "axios";

const API_URL = "http://localhost:7000/api/admins";

// Helper to get auth header with Bearer token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const getAllAdmins = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

const getAdminById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

const addAdmin = async (adminData) => {
  const response = await axios.post(API_URL, adminData, getAuthHeaders());
  return response.data;
};

const updateAdmin = async (id, adminData) => {
  const response = await axios.put(`${API_URL}/${id}`, adminData, getAuthHeaders());
  return response.data;
};

const deleteAdmin = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
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

