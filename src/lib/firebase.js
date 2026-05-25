// src/lib/firebase.js
// Replace with your actual Firebase project config
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

export const missingFirebaseEnvVars = requiredEnvVars.filter((key) => !import.meta.env[key])
export const isFirebaseConfigured = missingFirebaseEnvVars.length === 0

if (!isFirebaseConfigured) {
  console.warn(
    `Missing Firebase environment variables: ${missingFirebaseEnvVars.join(', ')}. ` +
    'Create a .env file from .env.example and restart the Vite dev server.'
  )
}

const firebaseConfig = isFirebaseConfigured
  ? {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    }
  : null

const app = firebaseConfig ? initializeApp(firebaseConfig) : null

export const auth = app ? getAuth(app) : null
export const db = app
  ? initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      experimentalForceLongPolling: true,
    })
  : null
export const storage = app ? getStorage(app) : null
export const googleProvider = app ? new GoogleAuthProvider() : null

export default app
