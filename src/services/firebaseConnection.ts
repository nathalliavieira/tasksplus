import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyBrLeVXfW7AVGj-eQwSXbcB_zBz1x_i0Mc",
    authDomain: "tarefasplus-312b0.firebaseapp.com",
    projectId: "tarefasplus-312b0",
    storageBucket: "tarefasplus-312b0.firebasestorage.app",
    messagingSenderId: "698370670748",
    appId: "1:698370670748:web:1ceb7fcf97b64557036d59"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export {db};