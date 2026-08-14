import axios from 'src/utils/axios';

type SendDailyReportParams = {
  companyID: string;
  date?: string;
  shopId?: string;
  brandId?: string;
  outletId?: string;
};

type GetPDFReportParams = {
  companyID: string;
  dateFrom?: string;
  dateTo?: string;
  brandId?: string;
  outletId?: string;
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
    brandId?: string | null;
    quantity: number;
    total: number;
    grandTotal: number;
    operationType: string;
    discountPercent?: number;
    discountAmount?: number;
    discountLabel?: string;
    shopShare?: number;
    brandShare?: number;
  }>;
  revenueShare?: {
    netTotal: number;
    shopShare: number;
    brandShare: number;
    commissionPercent?: number | null;
    brandName?: string | null;
    perBrand?: Array<{
      brandId: string | null;
      brandName: string;
      commissionPercent: number;
      netTotal: number;
      shopShare: number;
      brandShare: number;
    }>;
  };
  dateFrom: string | null;
  dateTo: string | null;
  brandName: string | null;
  statistics: {
    totalStockIn: number;
    totalSold: number;
    totalReturned: number;
    totalMissing?: number;
    totalMissingAmount?: number;
  } | null;
  scope?: 'combined' | 'AHANGAMA' | 'ARUGAM_BAY';
  lowStockItems?: Array<{
    itemName: string;
    brandName: string;
    itemCategory: string;
    stockQuantity: number;
    outletId?: string;
  }>;
  missingStockItems?: Array<{
    itemName: string;
    brandName: string;
    itemCategory: string;
    missingAmount: number;
    operationDate: string;
  }>;
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
export type { ReportData, GetPDFReportParams };

