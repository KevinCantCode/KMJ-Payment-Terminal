import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
// Replace these empty values with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAnky3Fx__EB0Db7e2A25Wy-_3VTvfUTLo",
    authDomain: "kmj-neuron.firebaseapp.com",
    databaseURL: "https://kmj-neuron-default-rtdb.firebaseio.com",
    projectId: "kmj-neuron",
    storageBucket: "kmj-neuron.firebasestorage.app",
    messagingSenderId: "82754344533",
    appId: "1:82754344533:web:1da7a2042341d41cec26dc",
    measurementId: "G-78551GW4MV"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth }; 