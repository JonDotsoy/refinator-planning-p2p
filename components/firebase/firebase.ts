import { initializeApp } from 'firebase/app';
import { getDocs, getDoc, collection, getFirestore } from 'firebase/firestore'

export const app = initializeApp({
    apiKey: "AIzaSyA5HiYzsq8BkJGCJNZtLHa4YOQ76YJ_1vg",
    authDomain: "planning-p2p.firebaseapp.com",
    databaseURL: "https://planning-p2p-default-rtdb.firebaseio.com",
    projectId: "planning-p2p",
    storageBucket: "planning-p2p.appspot.com",
    messagingSenderId: "126796717544",
    appId: "1:126796717544:web:319755cc30177097f3985d",
});

export const firestore = getFirestore(app);
