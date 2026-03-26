import axios from "./axiosConfig";

const API_URL = "http://localhost:7000/api/routines";

const getRoutineMatrix = async (schoolId) => {
    const response = await axios.get(API_URL, { params: { schoolId } });
    return response.data;
};

const updateOperatingHours = async (start, end, schoolId) => {
    const response = await axios.post(`${API_URL}/hours`, { start, end, schoolId });
    return response.data;
};

const updateGradeRoutine = async (gradeNumber, slots, isLocked, schoolId) => {
    const response = await axios.post(`${API_URL}/${gradeNumber}`, { slots, isLocked, schoolId });
    return response.data;
};

const routineService = {
    getRoutineMatrix,
    updateOperatingHours,
    updateGradeRoutine
};

export default routineService;
