import api from "../Utils/axiosInstance";

const API_URL = "/admins";

const getAllAdmins = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

const getAdminById = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

const addAdmin = async (adminData) => {
  const response = await api.post(API_URL, adminData);
  return response.data;
};

const updateAdmin = async (id, adminData) => {
  const response = await api.put(`${API_URL}/${id}`, adminData);
  return response.data;
};

const deleteAdmin = async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
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

