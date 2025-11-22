import axios from 'src/utils/axios';

export const getStockActivityData = async (companyID: string) => {
  if (!companyID) throw new Error('companyID is required');

  try {
    const response = await axios.get('/analytics/stock-activity', {
      params: { companyID },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stock activity:', error);
    throw error;
  }
};

