import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// Ambiguous characters (0/O, 1/I) removed so codes are easy to read aloud.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function genCode(len = 6) {
  let s = ''
  const arr = new Uint32Array(len)
  crypto.getRandomValues(arr)
  for (let i = 0; i < len; i++) s += ALPHABET[arr[i] % ALPHABET.length]
  return s
}

// Create the user's public profile doc on first sign-in (with a friend code).
// If a doc already exists but is missing a code (e.g. created by a racing
// profile-sync write), backfill one so it self-heals.
export async function ensureUserDoc(uid, base) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    const data = snap.data()
    if (!data.code) {
      const code = genCode()
      await updateDoc(ref, { code, friends: data.friends || [] })
      return { ...data, code }
    }
    return data
  }
  const data = {
    ...base,
    code: genCode(),
    friends: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  await setDoc(ref, data)
  return data
}

// Push the user's public profile + rolling stats so friends' leaderboards see it.
export async function syncProfile(uid, fields) {
  await setDoc(
    doc(db, 'users', uid),
    { ...fields, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

// Add a friend by their code. Writes only to your own doc (friends array).
export async function addFriendByCode(uid, rawCode) {
  const code = String(rawCode || '').trim().toUpperCase()
  if (!code) return { error: 'Enter a code first.' }
  const res = await getDocs(query(collection(db, 'users'), where('code', '==', code)))
  if (res.empty) return { error: "Hmm, no one has that code." }
  const friend = res.docs[0]
  if (friend.id === uid) return { error: "That's your own code!" }
  await updateDoc(doc(db, 'users', uid), { friends: arrayUnion(friend.id) })
  return { ok: true, friend: { id: friend.id, ...friend.data() } }
}

export async function removeFriend(uid, friendId) {
  await updateDoc(doc(db, 'users', uid), { friends: arrayRemove(friendId) })
}

// Live subscription to my doc; refetches friends' public docs when it changes.
export function subscribeToSocial(uid, cb, onError) {
  return onSnapshot(
    doc(db, 'users', uid),
    async (snap) => {
      if (!snap.exists()) return cb({ code: null, friends: [] })
      const me = snap.data()
      const ids = me.friends || []
      const friends = []
      for (const id of ids) {
        const fs = await getDoc(doc(db, 'users', id))
        if (fs.exists()) friends.push({ id, ...fs.data() })
      }
      cb({ code: me.code, friends })
    },
    (err) => onError?.(err)
  )
}
