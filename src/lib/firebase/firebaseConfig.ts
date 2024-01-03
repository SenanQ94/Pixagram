// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, onAuthStateChanged} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAUjQ4i3s2CG88ZGZRm74HrH78dscR2X40",
//   authDomain: "pixagram-a4a1b.firebaseapp.com",
//   projectId: "pixagram-a4a1b",
//   storageBucket: "pixagram-a4a1b.appspot.com",
//   messagingSenderId: "770906740157",
//   appId: "1:770906740157:web:fda4aa040429d1d5cbaed4",
//   measurementId: "G-30GZP60PP2"
// };
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBY9IidR0Ccewq543LQFysW4LTkP4l0Yk",
  authDomain: "pixagram-a0161.firebaseapp.com",
  projectId: "pixagram-a0161",
  storageBucket: "pixagram-a0161.appspot.com",
  messagingSenderId: "613088713180",
  appId: "1:613088713180:web:cdd2eaa767b3d4eb105719"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getFirestore(app);
const storage = getStorage(app);


//exports
export {auth, database, onAuthStateChanged, storage}