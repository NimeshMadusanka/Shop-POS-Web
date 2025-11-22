import axios from 'src/utils/axios';

type packages = {
    _id: string;
    name: string;
    minimumCost: number;
    packageType: string;
    facility: any;
    district: string;
    maplink: string;
    googleLocation: string;
    description: string;
    image1: string;
    image2: string;
    image3: string;
    image4: string;
    image5: string;
  };
  
  const createPackage = async (payload: packages) => {
    await axios.post(`/package/hotel-package/`, payload);
  };
  
  const getPackageData = async () => {
    const response = await axios.get(`/package/hotel_details`);
    return response?.data;
  };
 
  const updatePackageData = async (payload: packages) => {
    const response = await axios.put(`/package/hotelAdmin/${payload?._id}`, payload);
    return response?.data;
  };

  const deletePackageData = async (payload: packages) => {
    await axios.delete(`/package/${payload?._id}`);
  };

export { 
    createPackage, getPackageData, updatePackageData, deletePackageData
  };