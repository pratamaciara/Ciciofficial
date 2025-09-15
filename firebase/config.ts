
// Fix: Switched to a namespace import for firebase/app. This can work around module resolution
// issues in some environments that have trouble with named exports from this package.
import * as firebase from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration from user prompt
const firebaseConfig = {
    apiKey: "AIzaSyCFvlPrilTERciaJIepMhqL3l52pum7JaU",
    authDomain: "ciciofficial-app.firebaseapp.com",
    projectId: "ciciofficial-app",
    storageBucket: "ciciofficial-app.firebasestorage.app",
    messagingSenderId: "401170130440",
    appId: "1:401170130440:web:3bdb66fc74b99538db53bd",
    measurementId: "G-ZYQJHF49VY"
};

// Initialize Firebase
// Fix: Call initializeApp from the imported namespace.
const app = firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
