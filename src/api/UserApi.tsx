import axios from "src/utils/axios";

type createUser = {
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  emergencyPhoneNumber: string;
  role: string;
  itemSelect: string;
}

  const createUserApi = async (payload: createUser, boolValue:boolean) => {
    const response = await axios.post(`/user/hotel-user`, payload);
    return response?.data;
  }

  const getUserData = async() => {
    const response = await axios.get(`/user/get-hotel-user`);
    return response?.data;
  };

  const loginPinApi = async (email: string, pin: string) => {
    const response = await axios.post(`/user/login-pin`, { email, pin });
    return response?.data;
  };
  
export {  getUserData, createUserApi, loginPinApi  };