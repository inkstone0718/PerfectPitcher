import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCkdovQg-N31DxlqWp4uk8Fbn15vCWB7Z8",
  authDomain: "perfectpitcher-fd933.firebaseapp.com",
  databaseURL: "https://perfectpitcher-fd933-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "perfectpitcher-fd933",
  storageBucket: "perfectpitcher-fd933.firebasestorage.app",
  messagingSenderId: "423772968095",
  appId: "1:423772968095:web:e6f022363803d61215feaa",
  measurementId: "G-E5P546JD90"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
