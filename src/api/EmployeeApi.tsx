import axios from 'src/utils/axios';

type CreateEmployee = {
  firstName: string;
  lastName: string;
  nicNumber: string;
  role: string;
  gender: string;
  email: string;
  phoneNumber: string;
};

const createEmployeeApi = async (payload: CreateEmployee, boolValue: boolean) => {
  const response = await axios.post(`/employee/`, payload);
  return response?.data;
};

const updateEmployeeApi = async (payload: CreateEmployee, id: string, boolValue: boolean) => {
  const response = await axios.put(`/employee/${id}`, payload);
  return response?.data;
};

// src/api/EmployeeApi.ts
const getPayRunData = async (companyID: string, month?: string) => {
  const params: any = { companyID };
  if (month) params.month = month;

  const response = await axios.get('/Salarydata/monthly-salary', { params });
  return response.data;
};

const getEmployeeData = async (companyID: string) => {
  if (!companyID) throw new Error('companyID is required');

  const response = await axios.get('/employee', {
    params: { companyID },
  });

  return response?.data;
};

export { getEmployeeData, createEmployeeApi, updateEmployeeApi, getPayRunData };
