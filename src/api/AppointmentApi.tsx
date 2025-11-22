import axios from 'src/utils/axios';

type CreateAppointment = {
  clientName: string;
  serviceName: string;
  date: string;
  status: string;
  assignEmpID: string;
  assignStatus: string;
};

const createAppointmentApi = async (payload: CreateAppointment, boolValue: boolean) => {
  const response = await axios.post(`/appointment/`, payload);
  return response?.data;
};

const updateAppointmentApi = async (payload: Partial<CreateAppointment>, id: string) => {
  const response = await axios.put(`/appointment/${id}`, payload);
  return response?.data;
};

const updateEmpAppointmentApi = async (payload: Partial<CreateAppointment>, id: string) => {
  const response = await axios.put(`/appointment/empassign/${id}`, payload);
  return response?.data;
};

const sendAppointmentEmailApi = async (email: string, subject: string, message: string) => {
  const response = await axios.post('/user/send-appointment-email', {
    email,
    subject,
    message,
  });
  return response?.data;
};

const getAppointmentData = async (companyID: string) => {
  if (!companyID) throw new Error('companyID is required');

  const response = await axios.get('/appointment', {
    params: { companyID },
  });

  return response?.data;
};

export {
  getAppointmentData,
  createAppointmentApi,
  updateEmpAppointmentApi,
  updateAppointmentApi,
  sendAppointmentEmailApi,
};
