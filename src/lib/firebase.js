import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as fbUpdateProfile,
  deleteUser,
  signOut as fbSignOut,
} from 'firebase/auth'

// Firebase config is read from Vite env vars (see .env.example). Real Google
// sign-in turns on automatically once these are filled in; until then the app
// stays in the front-end demo mode so nothing breaks.
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseEnabled = Boolean(cfg.apiKey && cfg.authDomain && cfg.appId)

let auth = null
let db = null
if (firebaseEnabled) {
  const app = initializeApp(cfg)
  auth = getAuth(app)
  db = getFirestore(app)
}
export { auth, db }

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const res = await signInWithPopup(auth, provider)
  return res.user
}

export async function signInWithApple() {
  const provider = new OAuthProvider('apple.com')
  provider.addScope('email')
  provider.addScope('name')
  const res = await signInWithPopup(auth, provider)
  return res.user
}

export async function signUpWithEmail(email, password, name = '') {
  const res = await createUserWithEmailAndPassword(auth, email.trim(), password)
  if (name.trim()) {
    await fbUpdateProfile(res.user, { displayName: name.trim() })
  }
  return res.user
}

export async function signInWithEmail(email, password) {
  const res = await signInWithEmailAndPassword(auth, email.trim(), password)
  return res.user
}

export async function signOutFirebase() {
  if (auth) await fbSignOut(auth)
}

// Permanently delete the signed-in account. If the session is too old, Firebase
// requires a recent login — we sign out in that case so the caller can still
// clear local data and prompt a fresh sign-in.
export async function deleteAccountFirebase() {
  if (!auth?.currentUser) return
  try {
    await deleteUser(auth.currentUser)
  } catch (err) {
    await fbSignOut(auth)
    throw err
  }
}

// Turn Firebase's error codes into friendly, human messages.
export function authMessage(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks off.'
    case 'auth/email-already-in-use':
      return 'An account already exists for that email. Try signing in.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
