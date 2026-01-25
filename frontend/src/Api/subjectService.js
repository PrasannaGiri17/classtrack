import axios from "axios";

// Re-using grade API since the controller logic is there
const API_URL = "http://localhost:7000/api/grades";

const addSubject = async (gradeNumber, subjectName, type) => {
  const response = await axios.post(`${API_URL}/add-subject`, {
    gradeNumber,
    subjectName,
    type
  });
  return response.data;
};

const removeSubject = async (gradeNumber, subjectName) => {
  const response = await axios.post(`${API_URL}/remove-subject`, {
    gradeNumber,
    subjectName
  });
  return response.data;
};

const addSubjectGlobal = async (subjectName, type = 'core') => {
  const response = await axios.post(`${API_URL}/add-subject-global`, {
    subjectName,
    type
  });
  return response.data;
};

const removeSubjectGlobal = async (subjectName) => {
  const response = await axios.post(`${API_URL}/remove-subject-global`, {
    subjectName
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
