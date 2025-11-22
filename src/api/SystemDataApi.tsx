import axios from 'src/utils/axios';

export type SystemDataCategory = 
  | 'settings'
  | 'configuration'
  | 'audit'
  | 'notification'
  | 'backup'
  | 'maintenance'
  | 'other';

export type SystemData = {
  _id: string;
  key: string;
  category: SystemDataCategory;
  value: any; // Can be any type
  description?: string;
  companyID?: string | null;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

export type CreateSystemData = {
  key: string;
  category?: SystemDataCategory;
  value: any;
  description?: string;
  companyID?: string | null;
  isActive?: boolean;
  metadata?: Record<string, any>;
};

export type UpdateSystemData = Partial<CreateSystemData>;

// Get all system data
export const getSystemData = async (params?: {
  companyID?: string;
  category?: SystemDataCategory;
  isActive?: boolean;
  key?: string;
}) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/systemdata', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching system data:', error);
    throw error;
  }
};

// Get system data by ID
export const getSystemDataById = async (id: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/systemdata/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching system data:', error);
    throw error;
  }
};

// Get system data by key
export const getSystemDataByKey = async (key: string, companyID?: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/systemdata/key/${key}`, {
      params: { companyID },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching system data by key:', error);
    throw error;
  }
};

// Create system data
export const createSystemData = async (data: CreateSystemData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('/systemdata', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating system data:', error);
    throw error;
  }
};

// Update system data
export const updateSystemData = async (id: string, data: UpdateSystemData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`/systemdata/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating system data:', error);
    throw error;
  }
};

// Delete system data
export const deleteSystemData = async (id: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`/systemdata/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting system data:', error);
    throw error;
  }
};

// Upsert system data (create or update by key)
export const upsertSystemData = async (data: CreateSystemData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('/systemdata/upsert', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error upserting system data:', error);
    throw error;
  }
};

