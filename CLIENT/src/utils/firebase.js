// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider}from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:  import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "interviewiq-f8e3f.firebaseapp.com",
  projectId: "interviewiq-f8e3f",
  storageBucket: "interviewiq-f8e3f.firebasestorage.app",
  messagingSenderId: "776183935113",
  appId: "1:776183935113:web:5a600cb1ee5d85fb501658"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);
const provider=new GoogleAuthProvider();
export{auth,provider};
