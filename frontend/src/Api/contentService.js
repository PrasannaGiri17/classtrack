import axios from 'axios';

const API_URL = 'http://localhost:7000/api/content';

const contentService = {
    // Create a new resource
    createResource: async (resourceData) => {
        try {
            const response = await axios.post(`${API_URL}/create`, resourceData);
            return response.data;
        } catch (error) {
            console.error('Error creating resource:', error);
            throw error;
        }
    },

    // Get all resources for a specific teacher
    getTeacherResources: async (teacherId, folderId = null) => {
        try {
            const response = await axios.get(`${API_URL}/teacher/${teacherId}`, {
                params: { folderId }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching teacher resources:', error);
            throw error;
        }
    },

    // Get resource by ID
    getResourceById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching resource by ID:', error);
            throw error;
        }
    },

    // Update a resource
    updateResource: async (id, resourceData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, resourceData);
            return response.data;
        } catch (error) {
            console.error('Error updating resource:', error);
            throw error;
        }
    },

    // Archive a resource (soft delete)
    archiveResource: async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/archive`);
            return response.data;
        } catch (error) {
            console.error('Error archiving resource:', error);
            throw error;
        }
    },

    // Delete a resource permanently
    deleteResource: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting resource:', error);
            throw error;
        }
    },

    // Get resources by type
    getResourcesByType: async (type, teacherId) => {
        try {
            const response = await axios.get(`${API_URL}/type/${type}`, {
                params: { teacherId }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching resources by type:', error);
            throw error;
        }
    },

    // Get resources by subject
    getResourcesBySubject: async (subject, teacherId) => {
        try {
            const response = await axios.get(`${API_URL}/subject/${subject}`, {
                params: { teacherId }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching resources by subject:', error);
            throw error;
        }
    },
    // Get resources for a student
    getStudentResources: async (grade, section) => {
        try {
            const response = await axios.get(`${API_URL}/student/${grade}/${section}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching student resources:', error);
            throw error;
        }
    }
};

export default contentService;
