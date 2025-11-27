import axios from 'src/utils/axios';

type CreateBrand = {
  brandName: string;
  description?: string;
  providerId?: string;
  companyID: string;
};

type UpdateBrand = {
  brandName?: string;
  description?: string;
  providerId?: string | null;
};

const getBrandData = async (companyID: string) => {
  if (!companyID) throw new Error('companyID is required');
  const response = await axios.get('/brand', {
    params: { companyID },
  });
  return response?.data;
};

const createBrandApi = async (payload: CreateBrand) => {
  const response = await axios.post('/brand', payload);
  return response?.data;
};

const updateBrandApi = async (payload: UpdateBrand, id: string) => {
  const response = await axios.put(`/brand/${id}`, payload);
  return response?.data;
};

const deleteBrandApi = async (id: string) => {
  const response = await axios.delete(`/brand/${id}`);
  return response?.data;
};

export { getBrandData, createBrandApi, updateBrandApi, deleteBrandApi };

