import axios from "axios";

const API_URL = "http://localhost:7000/api/fees";

// Helper to get auth header
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const generateYearlyFees = async (studentId, academicYear) => {
    const response = await axios.post(`${API_URL}/generate`, { studentId, academicYear }, getAuthHeaders());
    return response.data;
};

const getAdminFeeStatus = async (params) => {
    const response = await axios.get(`${API_URL}/admin/status`, { ...getAuthHeaders(), params });
    return response.data;
};

const getStudentFees = async (studentId, academicYear) => {
    const params = academicYear ? { academicYear } : {};
    const response = await axios.get(`${API_URL}/student/${studentId}`, { ...getAuthHeaders(), params });
    return response.data;
};

const getMyFees = async () => {
    const response = await axios.get(`${API_URL}/my-fees`, getAuthHeaders());
    return response.data;
};

const getFeeById = async (id) => {
    const response = await axios.get(`${API_URL}/detail/${id}`, getAuthHeaders());
    return response.data;
};

const markAsPaid = async (id, paymentData) => {
    const response = await axios.patch(`${API_URL}/pay/${id}`, paymentData, getAuthHeaders());
    return response.data;
};

const addExtraFee = async (id, title, amount) => {
    const response = await axios.post(`${API_URL}/extra/${id}`, { title, amount }, getAuthHeaders());
    return response.data;
};

const deleteExtraFee = async (id, itemId) => {
    const response = await axios.delete(`${API_URL}/extra/${id}/${itemId}`, getAuthHeaders());
    return response.data;
};

const getFeeSummary = async (studentId, academicYear) => {
    const params = academicYear ? { academicYear } : {};
    const response = await axios.get(`${API_URL}/summary/${studentId}`, { ...getAuthHeaders(), params });
    return response.data;
};

const feeService = {
    generateYearlyFees,
    getAdminFeeStatus,
    getStudentFees,
    getMyFees,
    getFeeById,
    markAsPaid,
    addExtraFee,
    deleteExtraFee,
    getFeeSummary
};

export default feeService;
