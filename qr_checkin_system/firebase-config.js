// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBypq3GN0govoVCsg6QCp9diCnITAWn-6M",
  authDomain: "workercheckin-72200.firebaseapp.com",
  projectId: "workercheckin-72200",
  storageBucket: "workercheckin-72200.firebasestorage.app",
  messagingSenderId: "178538870528",
  appId: "1:178538870528:web:f36bb96a5dda80ae6865e5"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
