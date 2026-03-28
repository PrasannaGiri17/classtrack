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

const bulkGenerateFees = async (academicYear, schoolId) => {
    const response = await axios.post(`${API_URL}/admin/bulk-generate`, { academicYear, schoolId }, getAuthHeaders());
    return response.data;
};

const getAdminFeeStatus = async (schoolId) => {
    const response = await axios.get(`${API_URL}/admin/status`, { ...getAuthHeaders(), params: { schoolId, limit: 1000 } });
    return response.data;
};

// Note: Pagination handled on front-end for now in the new module
const getAdminFeeStatusWithSearch = async (params) => {
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

const markAsPaid = async (recordId, paymentData) => {
    const response = await axios.patch(`${API_URL}/pay/${recordId}`, paymentData, getAuthHeaders());
    return response.data;
};

const addExtraFee = async (recordId, title, amount) => {
    const response = await axios.post(`${API_URL}/extra/${recordId}`, { title, amount }, getAuthHeaders());
    return response.data;
};

const deleteExtraFee = async (recordId, itemId) => {
    const response = await axios.delete(`${API_URL}/extra/${recordId}/${itemId}`, getAuthHeaders());
    return response.data;
};

const getFeeSummary = async (studentId, academicYear) => {
    const params = academicYear ? { academicYear } : {};
    const response = await axios.get(`${API_URL}/summary/${studentId}`, { ...getAuthHeaders(), params });
    return response.data;
};

const feeService = {
    generateYearlyFees,
    bulkGenerateFees,
    getAdminFeeStatus,
    getAdminFeeStatusWithSearch,
    getStudentFees,
    getMyFees,
    getFeeById,
    markAsPaid,
    addExtraFee,
    deleteExtraFee,
    getFeeSummary
};

export default feeService;
