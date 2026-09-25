import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB9KE2q2xZAHj6Z3oXzbITaCK5XeLn6xb0",
  authDomain: "guardianband-project.firebaseapp.com",
  databaseURL: "https://guardianband-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "guardianband-project",
  storageBucket: "guardianband-project.firebasestorage.app",
  messagingSenderId: "1093126581076",
  appId: "1:1093126581076:web:2394286c8fe20b4fb8f6c1"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);