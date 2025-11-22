import axios from 'src/utils/axios';

type booking = {
  name: string;
  bookingType: string;
  typeId: string;
  price: string;
  discount: string;
  checkingDate: string;
  checkoutDate: string;
  adults: string;
  childrens: string;
  numberOfRooms: string;
  userName: string;
  userEmail: string;
  contactNumber: string;
  status: string;
};

const getBookingData = async () => {
  const response = await axios.get(`/booking/getbooking/`);
  return response?.data;
};

const updateBookingData = async (id: booking) => {
  const response = await axios.put(`/booking/${id}`);
  return response?.data;
};

const deleteBookingData = async (id: booking) => {
  await axios.delete(`/booking/${id}`);
};

export { getBookingData, updateBookingData, deleteBookingData };
