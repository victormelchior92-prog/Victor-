import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ⚠️ IMPORTANT : REMPLACEZ CECI PAR VOS CLES FIREBASE
// Allez sur https://console.firebase.google.com/
// Créez un projet "VTV"
// Allez dans Paramètres du projet -> Général -> Vos applications -> Web (</>)
// Copiez la config et collez-la ci-dessous :

const firebaseConfig = {
  apiKey: "REMPLACER_PAR_VOTRE_API_KEY",
  authDomain: "REMPLACER_PAR_VOTRE_PROJECT_ID.firebaseapp.com",
  projectId: "REMPLACER_PAR_VOTRE_PROJECT_ID",
  storageBucket: "REMPLACER_PAR_VOTRE_PROJECT_ID.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);