import axios from 'src/utils/axios';

type CreateUser = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  companyID: string;
  companyName: string;
  regNo: string;
  industry: string;
     salonImage?: string;
  role: string;
};

// const createSignupCompanyApi = async (payload: CreateUser, boolValue: boolean) => {
//   const response = await axios.post(`/user/signup`, payload);
//   return response?.data;
// };

// Signup functionality removed
