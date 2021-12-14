import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'
import { Analytics, getAnalytics, logEvent } from 'firebase/analytics'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5HiYzsq8BkJGCJNZtLHa4YOQ76YJ_1vg",
  authDomain: "planning-p2p.firebaseapp.com",
  databaseURL: "https://planning-p2p-default-rtdb.firebaseio.com",
  projectId: "planning-p2p",
  storageBucket: "planning-p2p.appspot.com",
  messagingSenderId: "126796717544",
  appId: "1:126796717544:web:319755cc30177097f3985d",
  measurementId: "${config.measurementId}"
};

export const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
export const analytics = getAnalytics(app);


type A = typeof logEvent extends (a: Analytics, ...args: infer R) => any ? R : never;

export const l = (...args: A) => {
  logEvent(analytics, ...args);
}
