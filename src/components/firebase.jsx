// src/firebase.js
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyB09jBWByclNrVby4-2B2zKbApL1l8_fyA",
  authDomain: "study-tracker-9cce2.firebaseapp.com",
  projectId: "study-tracker-9cce2",
  storageBucket: "study-tracker-9cce2.firebasestorage.app",
  messagingSenderId: "84752367066",
  appId: "1:84752367066:web:67bf299d3025b27db7d4e3"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
