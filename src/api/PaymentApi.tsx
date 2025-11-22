import axios from 'src/utils/axios';

type CreatePayment = {
 customerName?: string; 
  // services: string;
   cashPaid?: number;
  wirePaid?: number;
};

const createPaymentApi = async (payload: CreatePayment, boolValue: boolean) => {
  const response = await axios.post(`/payment/`, payload);
  return response?.data;
};

const updatePaymentApi = async (payload: CreatePayment, id: string, boolValue: boolean) => {
  const response = await axios.put(`/payment/${id}`, payload);
  return response?.data;
};

// const getPaymentData = async () => {
//   const response = await axios.get(`/payment/`);
//   return response?.data;
// };

const getPaymentData = async (companyID: string) => {
  if (!companyID) throw new Error('companyID is required');

  const response = await axios.get('/payment', {
    params: { companyID },
  });

  return response?.data;
};

export { getPaymentData, createPaymentApi, updatePaymentApi };
