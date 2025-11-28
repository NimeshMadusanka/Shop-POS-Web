import axios from 'src/utils/axios';

export type Shop = {
  _id: string;
  shopName: string;
  ownerEmail: string;
  contactPhone?: string;
  address?: string;
  companyID: string;
};

type CreateShop = Omit<Shop, '_id'>;
type UpdateShop = Partial<CreateShop>;

const getShopData = async (companyID: string) => {
  if (!companyID) throw new Error('companyID is required');
  const response = await axios.get('/shop', {
    params: { companyID },
  });
  return response?.data;
};

const createShopApi = async (payload: CreateShop) => {
  const response = await axios.post('/shop', payload);
  return response?.data;
};

const updateShopApi = async (id: string, payload: UpdateShop) => {
  const response = await axios.put(`/shop/${id}`, payload);
  return response?.data;
};

const deleteShopApi = async (id: string) => {
  const response = await axios.delete(`/shop/${id}`);
  return response?.data;
};

export { getShopData, createShopApi, updateShopApi, deleteShopApi };

