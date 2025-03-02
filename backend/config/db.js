import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };
dotenv.config();

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.databaseURL,
});

const fireStoreDb = getFirestore();

export { fireStoreDb};