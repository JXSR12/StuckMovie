// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCpKhoiT0YHIk00mlMN3dy7FHj7DsMCzBo",
    authDomain: "stuckinthemovie-57b60.firebaseapp.com",
    projectId: "stuckinthemovie-57b60",
    storageBucket: "stuckinthemovie-57b60.appspot.com",
    messagingSenderId: "901991557387",
    appId: "1:901991557387:web:9e444259ee95b6090c1a0e",
    measurementId: "G-H99HQHCN60"
  };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);
export const database = getFirestore(app);