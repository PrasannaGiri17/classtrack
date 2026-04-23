import axios from "./axiosConfig";

const API_URL = "http://localhost:7000/api/school-notifications";

const getNotifications = async (role, receiverId) => {
  const response = await axios.get(API_URL, {
    params: { role, receiverId }
  });
  return response.data;
};

const createNotification = async (notificationData) => {
  const response = await axios.post(`${API_URL}`, notificationData);
  return response.data;
};

const deleteNotification = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

const markAsRead = async (id) => {
  const response = await axios.patch(`${API_URL}/${id}/read`);
  return response.data;
};

const markAllAsRead = async (role) => {
  const response = await axios.patch(`${API_URL}/read-all`, null, {
    params: { role }
  });
  return response.data;
};

const schoolNotificationService = {
  getNotifications,
  createNotification,
  deleteNotification,
  markAsRead,
  markAllAsRead
};

export default schoolNotificationService;
