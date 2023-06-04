import firebase from "firebase"

const firebaseConfig = {
  apiKey: "AIzaSyB2-Z9ma6CmmO2k_zGHaHQRm5IMDN8ROzM",
  authDomain: "todo-c4d2d.firebaseapp.com",
  projectId: "todo-c4d2d",
  storageBucket: "todo-c4d2d.appspot.com",
  messagingSenderId: "36771481890",
  appId: "1:36771481890:web:7ab158bfd5b482d4583d7b",
  measurementId: "G-VXPJ6VJS6C"
};


const app= firebase.initializeApp(firebaseConfig)
const db = firebase.firestore();

export { db };