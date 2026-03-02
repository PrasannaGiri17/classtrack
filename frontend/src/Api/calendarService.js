import axios from "axios";

const API_URL = "http://localhost:7000/api/calendar";

const getEvents = async (from, to) => {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  
  const response = await axios.get(`${API_URL}/events`, { params });
  return response.data;
};

const calendarService = {
  getEvents
};

export default calendarService;
