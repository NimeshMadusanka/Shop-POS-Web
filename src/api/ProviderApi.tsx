import axios from 'src/utils/axios';

export type Provider = {
  _id: string;
  providerName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  companyID: string;
};

type CreateProvider = Omit<Provider, '_id'>;
type UpdateProvider = Partial<CreateProvider>;

const getProviderData = async (companyID: string) => {
  if (!companyID) throw new Error('companyID is required');
  const response = await axios.get('/provider', {
    params: { companyID },
  });
  return response?.data;
};

const createProviderApi = async (payload: CreateProvider) => {
  const response = await axios.post('/provider', payload);
  return response?.data;
};

const updateProviderApi = async (id: string, payload: UpdateProvider) => {
  const response = await axios.put(`/provider/${id}`, payload);
  return response?.data;
};

const deleteProviderApi = async (id: string) => {
  const response = await axios.delete(`/provider/${id}`);
  return response?.data;
};

export { getProviderData, createProviderApi, updateProviderApi, deleteProviderApi };

