import axios from 'src/utils/axios';

type CreateStudent = {
  name: string;
  email: string;
  phoneNumber: string;
};

const createStudentApi = async (payload: CreateStudent, boolValue: boolean) => {
  const response = await axios.post(`/company/`, payload);
  return response?.data;
};

const updateStudentApi = async (payload: CreateStudent, id: string, boolValue: boolean) => {
  const response = await axios.put(`/company/${id}`, payload);
  return response?.data;
};

const getStudentData = async () => {
  const response = await axios.get(`/company/`);
  return response?.data;
};

export { getStudentData, createStudentApi, updateStudentApi };
