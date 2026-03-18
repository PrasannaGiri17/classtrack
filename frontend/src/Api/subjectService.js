import axios from "axios";

// Re-using grade API since the controller logic is there
const API_URL = "http://localhost:7000/api/grades";

const addSubject = async (gradeNumber, subjectName, type, schoolId) => {
  const response = await axios.post(`${API_URL}/add-subject`, {
    gradeNumber,
    subjectName,
    type,
    schoolId
  });
  return response.data;
};

const removeSubject = async (gradeNumber, subjectName, schoolId) => {
  const response = await axios.post(`${API_URL}/remove-subject`, {
    gradeNumber,
    subjectName,
    schoolId
  });
  return response.data;
};

const addSubjectGlobal = async (subjectName, type = 'core', schoolId) => {
  const response = await axios.post(`${API_URL}/add-subject-global`, {
    subjectName,
    type,
    schoolId
  });
  return response.data;
};

const removeSubjectGlobal = async (subjectName, schoolId) => {
  const response = await axios.post(`${API_URL}/remove-subject-global`, {
    subjectName,
    schoolId
  });
  return response.data;
};

const subjectService = {
  addSubject,
  removeSubject,
  addSubjectGlobal,
  removeSubjectGlobal
};

export default subjectService;
