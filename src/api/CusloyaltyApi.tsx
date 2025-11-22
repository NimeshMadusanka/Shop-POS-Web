import axios from 'src/utils/axios';

type CreateCusloyalty = {
  discountName: string;
  itemName: string;
  offPercentage: string;
  description: string;
};

const createCusloyaltyApi = async (payload: CreateCusloyalty, boolValue: boolean) => {
  const response = await axios.post(`/cusloyalty/`, payload);
  return response?.data;
};

const updateCusloyaltyApi = async (payload: CreateCusloyalty, id: string, boolValue: boolean) => {
  const response = await axios.put(`/cusloyalty/${id}`, payload);
  return response?.data;
};

const updateCusloyaltyStatus = async (id: string, status: 'active' | 'inactive') => {
  const response = await axios.patch(`/cusloyalty/status/${id}`, { status });
  return response?.data;
};

const getCusloyaltyData = async (companyID: string) => {
  if (!companyID) throw new Error('companyID is required');

  const response = await axios.get('/cusloyalty', {
    params: { companyID },
  });

  return response?.data;
};

export { getCusloyaltyData, createCusloyaltyApi, updateCusloyaltyApi, updateCusloyaltyStatus };
