import axios from "src/utils/axios";
import { Dayjs } from 'dayjs';

const getData = async() => {
  const response = await axios.get(`/item/update-data`);
  return response?.data;
} 

type profile = {
  name: string;
  type:  string;
  iframeLocation:  string;
  navbarLocation:  string;
  district:  string;
  address:  string;
  phoneNumber:  string;
  email:  string;
  logo:  string;
  facebookLink:  string;
  instagramLink:  string;
  twitterLink:  string;
  websiteLink: string;
  maplink:  string;
  description:  string;
  facility:  any;
}

  const updateProfile = async (payload: profile) => {
    const response = await axios.put(`/item/profile-update/`, payload);
    return response?.data;
  } 

  type aboutUs = {
    aboutUstitle: string;
    aboutUsdescription: string;
    aboutUsbackgroundImage: string;
  }
  
    const updateAboutUs = async (payload: aboutUs) => {
      const response = await axios.put(`/item/aboutUs-update/`, payload);
      return response?.data;
    } 

  type welcomText = {
    welcometext:string;
    welcomedescription:string;
    welcomeimage1: string;
    welcomeimage2: string;
    welcomeimage3: string;
    welcomeimage4: string;
    welcomeimage5: string;
  }
  
    const updateWelcomText = async (payload: welcomText) => {
      const response = await axios.put(`/item/welcome-text-update/`, payload);
      return response?.data;
    } 

  type chooseUs = {
    title1: string;
    title2: string;
    title3: string;
    title4: string;
    description1: string;
    description4: string;
    description2: string;
    description3: string;
    image: string;
  }
  const updateChooseUs = async (payload: chooseUs) => {
    const response = await axios.put(`/item/chooseUs-update/`, payload);
    return response?.data;
  }

  type exclusive = {
    name: string;
    description:  string;
  }
  const updateExclusiveDeals = async (payload: exclusive) => {
    const response = await axios.put(`/item/exclusiveDeals-update/`, payload);
    return response?.data;
  }

  type hotelInfo = {
    checkIn: Dayjs | null;
    checkOut: Dayjs | null;
    description:  string;
  }
  const updateHotelInfo = async (payload: hotelInfo) => {
    const response = await axios.put(`/item/hotelInfo-update/`, payload);
    return response?.data;
  }

  type hotelFeature = {
    facility: any;
  }
  const updateHotelFeature = async (payload: hotelFeature) => {
    const response = await axios.put(`/item/hotelFeature-update/`, payload);
    return response?.data;
  }

  type gallery = {
    videolink:string;
    galleryimage1: string;
    galleryimage2: string;
    galleryimage3: string;
    galleryimage4: string;
    galleryimage5: string;
    galleryimage6: string;
    galleryimage7: string;
    galleryimage8: string;
    galleryimage9: string;
    galleryimage10: string;
  }
  const updateGallery = async (payload: gallery) => {
    const response = await axios.put(`/item/gallery/`, payload);
    return response?.data;
  }
   
  type youTube = {
    youTubelink1:string;
    youTubelink2: string;
    youTubelink3: string;
    youTubelink4: string;
    youTubelink5: string;
    youTubelink6: string;
  }
  const updateYouTube = async (payload: youTube) => {
    const response = await axios.put(`/item/youtube-reference/`, payload);
    return response?.data;
  }

  type setting = {
    apiKey:string;
    authDomain:string;
    projectId: string;
    storageBucket: string;
    messagingSenderId:string;
    appId:string;
  }
  const updateSetting = async (payload: setting) => {
    const response = await axios.put(`/item/upload-setting/`, payload);
    return response?.data;
  }

export {  getData, updateProfile, updateAboutUs, updateWelcomText, updateExclusiveDeals,
   updateHotelInfo, updateChooseUs, updateGallery, updateYouTube, updateSetting, updateHotelFeature  };