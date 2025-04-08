// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  arrayUnion,
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from "firebase/firestore";
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth } from "firebase/auth";

// Your Firebase configuration
console.log(process.env.REACT_APP_FIREBASE_API_KEY)
// Replace with your actual Firebase project config
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// // Connect to emulators in development mode
// if (process.env.NODE_ENV === 'development') {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     connectStorageEmulator(storage, 'localhost', 9199);
//     console.log('Using Firebase Emulators');
// } else console.log('Using Firebase Prod');
// Candidates collection reference
const candidatesRef = collection(db, "candidates");

// **Fixed: Adding collection export for Firestore functions**
export { db, auth, storage, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, arrayUnion };

// Save candidate data
export const saveCandidateData = async (candidateData) => {
  try {
    let r = await checkUniqueCandidate(candidateData.Email);
    if(r.success === false) {
      console.log(r.error); 
      return 0;
    }
  
    const docRef = await addDoc(candidatesRef, {
      ...candidateData,
      createdAt: new Date(),
      screenings: []
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding candidate: ", error);
    throw error;
  }
};

// Get all candidates
export const getCandidates = async () => {
  try {
    const querySnapshot = await getDocs(candidatesRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting candidates: ", error);
    throw error;
  }
};

export const checkUniqueCandidate = async (email) => {
  //const candidatesRef = collection(db, 'candidates'); // commented as global var already exists
  
  // Check if an email already exists
  const emailQuery = query(candidatesRef, where('Email', '==', email));
  const querySnapshot = await getDocs(emailQuery);

  if (!querySnapshot.empty) {
    console.error('Email already exists.');
    return { success: false, error: 'Email already exists.' }; // Indicate failure
  }
  return { success: true }
};

// Save screening result
export const saveScreeningResult = async (candidateId, screeningData) => {
  try {
    const candidateDoc = doc(db, "candidates", candidateId);
    await updateDoc(candidateDoc, {
      screenings: arrayUnion(screeningData)
    });    
    return true;
  } catch (error) {
    console.error("Error saving screening result: ", error);
    throw error;
  }
};

// Get screening results for a candidate
export const getScreeningResults = async (candidateId) => {
  try {
    const q = query(candidatesRef, where("id", "==", candidateId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().screenings || [];
    }
    return [];
  } catch (error) {
    console.error("Error getting screening results: ", error);
    throw error;
  }
};

export const loadPrompts = async () => {
  const querySnapshot = await getDocs(collection(db, "prompts"));
  const loadedPrompts = querySnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    role: doc.data().role || "No role assigned",  // ✅ Load role or show default text
    prompt: doc.data().prompt,
  }));

  if (loadedPrompts.length === 0) {
    console.log("No prompts found in the database."); // Debugging message
  }
  return loadedPrompts;  
};