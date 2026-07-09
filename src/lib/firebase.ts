import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.compose');

let cachedAccessToken: string | null = null;
export const setCachedAccessToken = (token: string | null) => cachedAccessToken = token;
export const getCachedAccessToken = () => cachedAccessToken;

export { signInWithPopup, signOut };
export { doc, setDoc, getDoc, collection, getDocs, query, where, Timestamp };
