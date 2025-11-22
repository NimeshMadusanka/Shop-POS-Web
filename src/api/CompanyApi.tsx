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

  const createSignupCompanyApi = (
  data: FormData | Record<string, any>, 
  isMultipart = false
) => {
  if (isMultipart) {
    return axios.post("/user/signup", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return axios.post("/user/signup", data); // plain JSON
};



const createSignupUserApi = async (payload: CreateUser, boolValue: boolean) => {
  const response = await axios.post(`/user/signup`, payload);
  return response?.data;
};



export { createSignupCompanyApi, createSignupUserApi };
