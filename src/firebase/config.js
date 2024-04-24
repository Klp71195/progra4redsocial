// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgvxNFUdg8OQXmjSnfEARfsnO0iPQNH74",
  authDomain: "db-proykim.firebaseapp.com",
  databaseURL: "https://db-proykim-default-rtdb.firebaseio.com",
  projectId: "db-proykim",
  storageBucket: "db-proykim.appspot.com",
  messagingSenderId: "364070619730",
  appId: "1:364070619730:web:3ed46d3f6da28285302d8b"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore();
const storage = getStorage(firebaseApp, "gs://db-proykim.appspot.com");

export { db, storage };