import axios from './axiosConfig';

const BASE_URL = 'http://localhost:7000/api/discussions';

const discussionService = {
  // Get all discussions with optional filters
  getDiscussions: async (filters = {}) => {
    try {
      const response = await axios.get(BASE_URL, { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get a single discussion by ID
  getDiscussionById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new discussion
  createDiscussion: async (discussionData) => {
    try {
      const response = await axios.post(BASE_URL, discussionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a discussion
  deleteDiscussion: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Report a discussion
  reportDiscussion: async (id) => {
    try {
      const response = await axios.post(`${BASE_URL}/${id}/report`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // --- Comments ---

  // Get comments for a specific post
  getComments: async (postId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${postId}/comments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add a comment to a post
  addComment: async (postId, commentData) => {
    try {
      const response = await axios.post(`${BASE_URL}/${postId}/comments`, commentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default discussionService;
