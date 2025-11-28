import axios from 'src/utils/axios';

type StockAlert = {
  _id: string;
  itemId: {
    _id: string;
    itemName: string;
    brandName?: string;
    stockQuantity: number;
    status: string;
  };
  itemName: string;
  brandName: string;
  currentStock: number;
  lastAlertSent: string;
  nextAlertDate: string;
  alertCount: number;
  isResolved: boolean;
};

const getStockAlertsApi = async (companyID: string): Promise<StockAlert[]> => {
  if (!companyID) throw new Error('companyID is required');
  const response = await axios.get('/stockAlert', {
    params: { companyID },
  });
  return response?.data || [];
};

const checkLowStockApi = async (companyID: string) => {
  if (!companyID) throw new Error('companyID is required');
  const response = await axios.post('/stockAlert/check', { companyID });
  return response?.data;
};

export { getStockAlertsApi, checkLowStockApi };
export type { StockAlert };

