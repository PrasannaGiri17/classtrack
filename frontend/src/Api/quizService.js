import axios from "axios";

const API_URL = "http://localhost:7000/api/quizzes";

const getAllQuizzes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const getQuizById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

const createQuiz = async (quizData) => {
  const response = await axios.post(API_URL, quizData);
  return response.data;
};

const updateQuiz = async (id, quizData) => {
  const response = await axios.put(`${API_URL}/${id}`, quizData);
  return response.data;
};

const deleteQuiz = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

const submitResult = async (id, resultData) => {
  const response = await axios.post(`${API_URL}/${id}/result`, resultData);
  return response.data;
};

const quizService = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitResult
};

export default quizService;
