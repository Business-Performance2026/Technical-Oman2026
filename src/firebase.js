import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANhAwQBWqyzzyhqio3DPKZcLVb5MyisGg",
  authDomain: "technical-oman-e7b37.firebaseapp.com",
  databaseURL: "https://technical-oman-e7b37-default-rtdb.firebaseio.com",
  projectId: "technical-oman-e7b37",
  storageBucket: "technical-oman-e7b37.firebasestorage.app",
  messagingSenderId: "730737125878",
  appId: "1:730737125878:web:344ade923ed27ab6bdbfd7",
  measurementId: "G-06QJ5CPCLV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
