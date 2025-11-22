import axios from 'src/utils/axios';

type CreateCustomer = {
  firstName: string;
  lastName: string;
  nicNumber: string;
  email: string;
  phoneNumber: string;
};

const createCustomerApi = async (payload: CreateCustomer, boolValue: boolean) => {
  const response = await axios.post(`/customer/`, payload);
  return response?.data;
};

const updateCustomerApi = async (payload: CreateCustomer, id: string, boolValue: boolean) => {
  const response = await axios.put(`/customer/${id}`, payload);
  return response?.data;
};

// const getCustomerData = async () => {
//   const response = await axios.get(`/customer/`);
//   return response?.data;
// };

const getCustomernewData = async (companyID: string) => {
  if (!companyID) throw new Error('companyID is required');

  const response = await axios.get('/customer/', {
    params: { companyID },
  });

  return response?.data;
};

export { getCustomernewData, createCustomerApi, updateCustomerApi };
