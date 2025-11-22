import axios from 'src/utils/axios';

type CreateCategory = { catgName: string; description: string };

const createCategoryApi = async (payload: CreateCategory, boolValue: boolean) => {
  const response = await axios.post(`/category/`, payload);
  return response?.data;
};

const updateCategoryApi = async (payload: CreateCategory, id: string, boolValue: boolean) => {
  const response = await axios.put(`/category/${id}`, payload);
  return response?.data;
};

const getCategoryData = async () => {
  const response = await axios.get(`/category/`);
  return response?.data;
};

export { getCategoryData, createCategoryApi, updateCategoryApi };
