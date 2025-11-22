import axios from 'src/utils/axios';

type CreateItem = {
  itemName: string;
  itemCategory: string;
  itemPrice: string;
  itemDuration: string;
  stockQuantity?: number;
};

const createItemApi = async (payload: CreateItem, boolValue: boolean) => {
  const response = await axios.post(`/item/`, payload);
  return response?.data;
};

const updateItemApi = async (payload: CreateItem, id: string, boolValue: boolean) => {
  const response = await axios.put(`/item/${id}`, payload);
  return response?.data;
};

const getItemData = async (companyID: string) => {
  if (!companyID) throw new Error('companyID is required');

  const response = await axios.get('/item', {
    params: { companyID },
  });

  return response?.data;
};

const addStockApi = async (itemId: string, quantity: number) => {
  const response = await axios.post(`/item/${itemId}/add-stock`, { quantity });
  return response?.data;
};

const updateStockApi = async (itemId: string, stockQuantity: number) => {
  const response = await axios.put(`/item/${itemId}/stock`, { stockQuantity });
  return response?.data;
};

export { getItemData, createItemApi, updateItemApi, addStockApi, updateStockApi };
