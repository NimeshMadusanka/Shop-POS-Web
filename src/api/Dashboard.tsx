import axios from "src/utils/axios";

const getDashboardData = async (companyID: string, outletId?: string) => {
  if (!companyID) throw new Error('companyID is required');
  
  const response = await axios.get(`/dashboard/dashboard-data`, {
    params: { companyID, ...(outletId ? { outletId } : {}) },
  });
  return response?.data;
}

export { getDashboardData };