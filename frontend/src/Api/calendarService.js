import axios from "./axiosConfig";

const API_URL = "http://localhost:7000/api/calendar/events";

const getEvents = async (from, to, createdBy) => {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  if (createdBy) params.createdBy = createdBy;
  
  const response = await axios.get(API_URL, { params });
  return response.data;
};


const createEvent = async (eventData) => {
  const response = await axios.post(API_URL, eventData);
  return response.data;
};

const deleteEvent = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

const calendarService = {
  getEvents,
  createEvent,
  deleteEvent
};

export default calendarService;

