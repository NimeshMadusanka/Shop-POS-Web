import axios from 'src/utils/axios';

type CreatePayment = {
 customerName?: string;
 customerPhone?: string;
 customerPhoneNumber?: string; // Frontend uses this name
  // services: string;
   cashPaid?: number;
  creditPaid?: number;
  debitPaid?: number;
  wirePaid?: number; // Deprecated - kept for backward compatibility
  invoiceNumber?: string; // Generated on backend, but can be provided
  items?: any[];
  addLoyalty?: boolean;
  newoffPercentage?: number;
  billDiscountPercentage?: number;
  date?: string;
  companyID?: string;
  outletId?: 'AHANGAMA' | 'ARUGAM_BAY';
  commission?: boolean;
  commissionAmount?: number | string;
  specialNote?: string;
  isReversal?: boolean;
  reversalOf?: string;
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

const getPaymentData = async (companyID: string, outletId?: string) => {
  if (!companyID) throw new Error('companyID is required');

  const response = await axios.get('/payment', {
    params: { companyID, ...(outletId ? { outletId } : {}) },
  });

  return response?.data;
};

type ReturnItem = {
  itemId: string;
  quantity: number;
};

const returnStockApi = async (paymentId: string, returnItems: ReturnItem[], companyID: string) => {
  const response = await axios.post(`/payment/${paymentId}/return`, {
    returnItems,
    companyID,
  });
  return response?.data;
};

const refundPaymentApi = async (paymentId: string, companyID: string) => {
  const response = await axios.post(`/payment/${paymentId}/refund`, {
    companyID,
  });
  return response?.data;
};

const partialRefundApi = async (
  paymentId: string,
  returnItems: ReturnItem[],
  companyID: string
) => {
  const response = await axios.post(`/payment/${paymentId}/partial-refund`, {
    returnItems,
    companyID,
  });
  return response?.data;
};

const getPaymentByInvoiceNumber = async (invoiceNumber: string, companyID?: string) => {
  const params: any = {};
  if (companyID) {
    params.companyID = companyID;
  }
  const response = await axios.get(`/payment/invoice/${invoiceNumber}`, { params });
  return response?.data;
};

export {
  getPaymentData,
  createPaymentApi,
  updatePaymentApi,
  returnStockApi,
  refundPaymentApi,
  partialRefundApi,
  getPaymentByInvoiceNumber,
};
