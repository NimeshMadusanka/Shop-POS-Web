
import axios from 'src/utils/axios';



const getAssesmentData = async () => {
  const response = await axios.get(`/assesment/`);
  return response?.data;
};

export { getAssesmentData };
