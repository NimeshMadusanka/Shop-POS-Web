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

const getItemData = async (companyID: string, brandId?: string) => {
  if (!companyID) throw new Error('companyID is required');

  const params: any = { companyID };
  if (brandId) {
    params.brandId = brandId;
  }

  const response = await axios.get('/item', {
    params,
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

const returnStockItemApi = async (itemId: string, quantity: number, companyID: string) => {
  const response = await axios.post(`/item/${itemId}/stock-out`, { quantity, companyID });
  return response?.data;
};

const discontinueItemApi = async (itemId: string) => {
  const response = await axios.patch(`/item/${itemId}/discontinue`);
  return response?.data;
};

const stockOutApi = async (itemId: string, quantity: number, reason: string, companyID: string) => {
  const response = await axios.post(`/item/${itemId}/stock-out`, { quantity, reason, companyID });
  return response?.data;
};

export { getItemData, createItemApi, updateItemApi, addStockApi, updateStockApi, stockOutApi, returnStockItemApi, discontinueItemApi };
