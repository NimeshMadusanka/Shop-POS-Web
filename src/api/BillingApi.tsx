import axios from "src/utils/axios";

type createBill = {
  attachment: string;
  reference: string;
  paidAmount: string;
}

const companyTopUpApi = async(payload: createBill) => {
  await axios.post(`/billing/topup`, payload);
}

const getWalletBalance = async() => {
  const response = await axios.get(`/billing/hotel/walletBalance`);
  return response?.data;
}

const loadTopUpHistoryApi = async() => {
  const response = await axios.get('/billing/history');
  return response?.data;
}

export {companyTopUpApi, getWalletBalance,  loadTopUpHistoryApi};
