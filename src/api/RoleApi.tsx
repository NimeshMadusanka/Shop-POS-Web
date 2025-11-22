import axios from 'src/utils/axios';

type CreateRole = {
  roleName: string;
  monthlySalary: number | string; // string if coming from input field
  allowances?: number | string;    // optional
  deductions?: number | string;    // optional
  id?: string;                     // optional for edit
};


const createRoleApi = async (payload: CreateRole, boolValue: boolean) => {
  const response = await axios.post(`/role/`, payload);
  return response?.data;
};

const updateRoleApi = async (payload: CreateRole, id: string, boolValue: boolean) => {
  const response = await axios.put(`/role/${id}`, payload);
  return response?.data;
};

const getRoleData = async (companyID: string) => {
  if (!companyID) throw new Error('companyID is required');

  const response = await axios.get('/role', {
    params: { companyID },
  });

  return response?.data;
};

export { getRoleData, createRoleApi, updateRoleApi };
