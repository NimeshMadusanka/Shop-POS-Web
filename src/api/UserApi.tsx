import axios from "src/utils/axios";

type createUser = {
  userName: string;
  email: string;
  password?: string;
  pin?: string;
  phoneNumber: string;
  emergencyPhoneNumber: string;
  role: string;
  itemSelect: string;
  assignedOutletId?: 'AHANGAMA' | 'ARUGAM_BAY' | null;
};

type updateUser = {
  userName: string;
  email: string;
  password?: string;
  pin?: string;
  phoneNumber: string;
  emergencyPhoneNumber: string;
  role: string;
  assignedOutletId?: 'AHANGAMA' | 'ARUGAM_BAY' | null;
};

const createUserApi = async (payload: createUser, boolValue: boolean) => {
  const response = await axios.post(`/user/hotel-user`, payload);
  return response?.data;
};

const updateUserApi = async (payload: updateUser, id: string) => {
  const response = await axios.put(`/user/hotel-user/${id}`, payload);
  return response?.data;
};

const deleteUserApi = async (id: string) => {
  const response = await axios.delete(`/user/hotel-user/${id}`);
  return response?.data;
};

const getUserData = async () => {
  const response = await axios.get(`/user/get-hotel-user`);
  return response?.data;
};

const loginPinApi = async (email: string, pin: string) => {
  const response = await axios.post(`/user/login-pin`, { email, pin });
  return response?.data;
};

export { getUserData, createUserApi, updateUserApi, deleteUserApi, loginPinApi };
