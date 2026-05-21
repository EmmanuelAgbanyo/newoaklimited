import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA4gIY7QyFh06gl9uSKDjC0uKlzUq5VepA",
  authDomain: "ewoak-33.firebaseapp.com",
  projectId: "ewoak-33",
  databaseURL: "https://ewoak-33-default-rtdb.firebaseio.com",
  storageBucket: "ewoak-33.firebasestorage.app",
  messagingSenderId: "759167037504",
  appId: "1:759167037504:web:993639f49c5c57d0eaafa5",
  measurementId: "G-5RQ93PLCJW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app, "https://ewoak-33-default-rtdb.firebaseio.com");
