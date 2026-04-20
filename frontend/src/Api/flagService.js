import axios from './axiosConfig';

const API_URL = 'http://localhost:7000/api/flags';

const flagService = {
  getStudentFlags: async (studentId) => {
    try {
      const response = await axios.get(`${API_URL}/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student flags:', error);
      return [];
    }
  },
  
  getLatestFlag: async (studentId) => {
    try {
      const flags = await flagService.getStudentFlags(studentId);
      if (flags && flags.length > 0) {
        // Flags are already sorted by academicYear: -1 in backend
        return flags[0];
      }
      return null;
    } catch (error) {
      return null;
    }
  }
};

export default flagService;
