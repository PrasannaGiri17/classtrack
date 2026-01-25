import axios from "axios";

const API_URL = "http://localhost:7000/api/routines";

const getRoutineMatrix = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const updateOperatingHours = async (start, end) => {
    const response = await axios.post(`${API_URL}/hours`, { start, end });
    return response.data;
};

const updateGradeRoutine = async (gradeNumber, slots, isLocked) => {
    const response = await axios.post(`${API_URL}/${gradeNumber}`, { slots, isLocked });
    return response.data;
};

const routineService = {
    getRoutineMatrix,
    updateOperatingHours,
    updateGradeRoutine
};

export default routineService;
