import api from "../Utils/axiosInstance";

const API_URL = "/fees";
const PAYMENT_URL = "/payment/khalti";
const ESEWA_PAYMENT_URL = "/payment/esewa";

const generateYearlyFees = async (studentId, academicYear) => {
    const response = await api.post(`${API_URL}/generate`, { studentId, academicYear });
    return response.data;
};

const bulkGenerateFees = async (academicYear, schoolId) => {
    const response = await api.post(`${API_URL}/admin/bulk-generate`, { academicYear, schoolId });
    return response.data;
};

const getAdminFeeStatus = async (schoolId) => {
    const response = await api.get(`${API_URL}/admin/status`, { params: { schoolId, limit: 1000 } });
    return response.data;
};

// Note: Pagination handled on front-end for now in the new module
const getAdminFeeStatusWithSearch = async (params) => {
    const response = await api.get(`${API_URL}/admin/status`, { params });
    return response.data;
};

const getStudentFees = async (studentId, academicYear) => {
    const params = academicYear ? { academicYear } : {};
    const response = await api.get(`${API_URL}/student/${studentId}`, { params });
    return response.data;
};

const getMyFees = async () => {
    const response = await api.get(`${API_URL}/my-fees`);
    return response.data;
};

const getFeeById = async (id) => {
    const response = await api.get(`${API_URL}/detail/${id}`);
    return response.data;
};

const markAsPaid = async (recordId, paymentData) => {
    const response = await api.patch(`${API_URL}/pay/${recordId}`, paymentData);
    return response.data;
};

const addExtraFee = async (recordId, title, amount) => {
    const response = await api.post(`${API_URL}/extra/${recordId}`, { title, amount });
    return response.data;
};

const deleteExtraFee = async (recordId, itemId) => {
    const response = await api.delete(`${API_URL}/extra/${recordId}/${itemId}`);
    return response.data;
};

const getFeeSummary = async (studentId, academicYear) => {
    const params = academicYear ? { academicYear } : {};
    const response = await api.get(`${API_URL}/summary/${studentId}`, { params });
    return response.data;
};

const initiateKhaltiPayment = async (paymentData) => {
    const response = await api.post(`${PAYMENT_URL}/initiate`, paymentData);
    return response.data;
};

const initiateEsewaPayment = async (paymentData) => {
    const response = await api.post(`${ESEWA_PAYMENT_URL}/initiate`, paymentData);
    return response.data;
};

const syncStudentLedger = async (studentId, academicYear) => {
    const response = await api.post(`${API_URL}/admin/sync/${studentId}`, { academicYear });
    return response.data;
};

const feeService = {
    generateYearlyFees,
    bulkGenerateFees,
    syncStudentLedger,
    getAdminFeeStatus,
    getAdminFeeStatusWithSearch,
    getStudentFees,
    getMyFees,
    getFeeById,
    markAsPaid,
    addExtraFee,
    deleteExtraFee,
    getFeeSummary,
    initiateKhaltiPayment,
    initiateEsewaPayment
};

export default feeService;
