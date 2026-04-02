import axios from './axiosConfig';

const API_BASE_URL = "http://localhost:7000/api";

const userService = {
  // Get searchable users filtered by permissions and school
  getUsers: async (searchQuery = '') => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users${searchQuery ? `?search=${searchQuery}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default userService;
