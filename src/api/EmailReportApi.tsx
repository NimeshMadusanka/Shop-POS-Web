import axios from 'src/utils/axios';

type SendDailyReportParams = {
  companyID: string;
  date?: string;
  shopId?: string;
  brandId?: string;
};

type GetPDFReportParams = {
  companyID: string;
  dateFrom?: string;
  dateTo?: string;
  brandId?: string;
};

type ReportData = {
  providerShopTransactions: Array<{
    operationDate: string;
    providerName: string;
    itemName: string;
    brandName: string;
    amount: number;
    operationType: string;
  }>;
  shopClientTransactions: Array<{
    date: string;
    invoiceNumber: string;
    itemName: string;
    brandName: string;
    quantity: number;
    total: number;
    grandTotal: number;
    operationType: string;
  }>;
  dateFrom: string | null;
  dateTo: string | null;
  brandName: string | null;
  statistics: {
    totalStockIn: number;
    totalSold: number;
    totalReturned: number;
  } | null;
};

const sendDailyReportApi = async (params: SendDailyReportParams) => {
  const response = await axios.post('/emailReport/daily', params);
  return response?.data;
};

const getPDFReportApi = async (params: GetPDFReportParams) => {
  const response = await axios.get('/emailReport/pdf', { params });
  return response?.data;
};

const getReportDataApi = async (params: GetPDFReportParams): Promise<ReportData> => {
  const response = await axios.get('/emailReport/data', { params });
  return response?.data;
};

export { sendDailyReportApi, getPDFReportApi, getReportDataApi };
export type { ReportData };

