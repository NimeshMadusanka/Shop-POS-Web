import axios from 'src/utils/axios';

type places = {
    _id: string;
    name: string;
    district: string;
    description: string;
    minimumCost: number;
    googleLocation: string;
    maplink: string;
    image1: string;
    image2: string;
    image3: string;
    image4: string;
    image5: string;
  };
  
  const createPlaces = async (payload: places) => {
    await axios.post(`/places/${payload?._id}`, payload);
  };
  
  const getPlacesData = async () => {
    const response = await axios.get(`/places/hotel_details`);
    return response?.data;
  };
  
  const updatePlacesData = async (payload: places) => {
    const response = await axios.put(`/places/${payload?._id}`, payload);
    return response?.data;
  };
  
  const deletePlacesData = async (payload: places) => {
    await axios.delete(`/places/${payload?._id}`);
  };

export { 
    createPlaces, getPlacesData, updatePlacesData, deletePlacesData
  };