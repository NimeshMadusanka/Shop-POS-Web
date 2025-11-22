import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const app = initializeApp({
  apiKey: 'AIzaSyDHTI_mVemjpmqFBXdQPGGIlM2LnkAQvnI',
  authDomain: 'image-upload-6851d.firebaseapp.com',
  projectId: 'image-upload-6851d',
  storageBucket: 'image-upload-6851d.appspot.com',
  messagingSenderId: '887540393866',
  appId: '1:887540393866:web:9f77becee4c81645550a73',
});

const storage = getStorage(app);
export default storage;
