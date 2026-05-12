import axios from 'src/utils/axios';

export const getStockActivityData = async (companyID: string, outletId?: string) => {
  if (!companyID) throw new Error('companyID is required');

  try {
    const response = await axios.get('/analytics/stock-activity', {
      params: { companyID, ...(outletId ? { outletId } : {}) },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stock activity:', error);
    throw error;
  }
};

