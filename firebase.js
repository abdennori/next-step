// firebase.js

// استيراد Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔥🔥🔥 إعدادات مشروعك (استبدل ONLY_API_KEY_HERE بالمفتاح الحقيقي) 🔥🔥🔥
const firebaseConfig = {
  apiKey: "AIzaSyD2-dQOk7IMpk2x2HaiNa5b9gnS4MluPoc", // ⚠️ الصق هنا المفتاح الذي نسخته من Firebase Console
  authDomain: "orientation-8973f.firebaseapp.com",
  projectId: "orientation-8973f",
  storageBucket: "orientation-8973f.appspot.com",
  messagingSenderId: "1071963797818",
  appId: "1:1071963797818:web:11304541fe1f34b123f803"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// تصدير التوابع لاستخدامها في باقي الملفات
export {
  db,
  auth,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  signInWithEmailAndPassword
};
