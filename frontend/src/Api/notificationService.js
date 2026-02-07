import axios from "axios";

const API_URL = "http://localhost:7000/api/notifications";

const getNotifications = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const createNotification = async (notificationData) => {
  const response = await axios.post(`${API_URL}/create`, notificationData);
  return response.data;
};

const deleteNotification = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

const notificationService = {
  getNotifications,
  createNotification,
  deleteNotification
};

export default notificationService;
