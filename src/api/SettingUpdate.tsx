import axios from "src/utils/axios";

const getSettingData = async() => {
  const response = await axios.get(`/item/update-data`);
  return response?.data;
} 

type primary = {
    primaryColor:string;
    primaryTextColor:string;
    sectionBackgroundColor: string;
    fontFamily: string;
}

  const updatePrimaryColors = async (payload: primary) => {
    const response = await axios.put(`/property/property-update`, payload);
    return response?.data;
  } 

type footer = {
  footertextColor:string;
  footerbackgroundColor:string;
}

  const updateFooterColors = async (payload: footer) => {
    const response = await axios.put(`/property/footer-style-update`, payload);
    return response?.data;
  } 

type offer = {
  offersectionBackgroundColor:string;
  offergreatBackgroundColor:string;
  offergreatTextColor:string;
  offerbtntextColor:string;
  offerbtnbackgroundColor:string;
}

  const updateOfferColors = async (payload: offer) => {
    const response = await axios.put(`/property/offer-style-update`, payload);
    return response?.data;
  } 

type button = {
  buttonTextColor:string;
  buttonBackgroundColor:string;
}

  const updateButtonColors = async (payload: button) => {
    const response = await axios.put(`/property/button-style-update`, payload);
    return response?.data;
  } 

type searchBar = {
  searchBaractiveButtonColor:string;
  searchBaractiveTextColor:string;
  searchBardefaultButtonColor:string;
  searchBardefaultTextColor:string;
}

  const updateSearchBarColors = async (payload: searchBar) => {
    const response = await axios.put(`/property/searchbar-style-update`, payload);
    return response?.data;
  } 

export {  getSettingData, updatePrimaryColors, updateFooterColors, updateOfferColors, updateButtonColors, updateSearchBarColors };