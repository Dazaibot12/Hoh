import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// This config is for CLIENT-SIDE initialization
const firebaseConfig = {
  "projectId": "dazai-31643013-4392d",
  "appId": "1:921978581721:web:40ea560abb302a17d9c4c8",
  "apiKey": "AIzaSyBdmryVNiTCsCfJDkDhkEBdwAYHQEHOF2c",
  "authDomain": "dazai-31643013-4392d.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "921978581721"
};

// Initialize Firebase only once on the client
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
