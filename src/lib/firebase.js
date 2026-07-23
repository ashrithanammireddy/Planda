import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
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
if (firebaseEnabled) {
  const app = initializeApp(cfg)
  auth = getAuth(app)
}
export { auth }

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

export async function signOutFirebase() {
  if (auth) await fbSignOut(auth)
}
