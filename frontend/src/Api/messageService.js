import axios from './axiosConfig';

const API_BASE_URL = "http://localhost:7000/api";

const messageService = {
  // Get messageable contacts filtered by role/school permissions
  getContacts: async (search = '') => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users${search ? `?search=${search}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all conversations list (latest message per contact)
  getConversations: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get full chat history with a specific user
  getMessages: async (receiverId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/${receiverId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send a new message
  sendMessage: async (messageData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/messages/send`, messageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark all messages in a conversation as read
  markAsRead: async (conversationId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/messages/read/${conversationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a message (sender only)
  deleteMessage: async (messageId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // User Blocking
  blockUser: async (userId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/messages/block/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  unblockUser: async (userId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/messages/unblock/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default messageService;
