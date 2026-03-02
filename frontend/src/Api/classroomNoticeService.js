import axios from "axios";

const API_URL = "http://localhost:7000/api/classroom-notices";

const getNoticesBySection = async (sectionId) => {
  const response = await axios.get(`${API_URL}/section/${sectionId}`);
  return response.data;
};

const createNotice = async (noticeData) => {
  const response = await axios.post(API_URL, noticeData);
  return response.data;
};

const deleteNotice = async (id, userId, userType) => {
  const response = await axios.delete(`${API_URL}/${id}`, { data: { userId, userType } });
  return response.data;
};

const togglePinNotice = async (id, userId, userType) => {
  const response = await axios.patch(`${API_URL}/${id}/pin`, { userId, userType });
  return response.data;
};

const classroomNoticeService = {
  getNoticesBySection,
  createNotice,
  deleteNotice,
  togglePinNotice,
};

export default classroomNoticeService;
