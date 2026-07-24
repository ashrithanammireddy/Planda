import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, firebaseEnabled } from '../lib/firebase'
import { ensureUserDoc, syncProfile, addFriendByCode, removeFriend, subscribeToSocial } from '../lib/social'
import { useStore } from './StoreContext'
import { computeStats } from '../lib/stats'
import { computeBadges, badgePointsFrom } from '../lib/badges'
import { computePoints } from '../lib/ranks'

const SocialContext = createContext(null)

// Real friends via Firestore: each signed-in user has a public profile doc with
// a friend code; adding a friend by code lets their stats show on your board.
export function SocialProvider({ children }) {
  const store = useStore()
  const { profile, settings, assessments, sessions, items, focusLog } = store
  const [uid, setUid] = useState(null)
  const [myCode, setMyCode] = useState(null)
  const [friends, setFriends] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!firebaseEnabled || !auth) return
    return onAuthStateChanged(auth, (u) => setUid(u?.uid || null))
  }, [])

  useEffect(() => {
    if (!uid) {
      setMyCode(null)
      setFriends([])
      setReady(false)
      return
    }
    let unsub
    ensureUserDoc(uid, {
      name: profile.name || 'You',
      avatar: profile.avatar,
      glasses: profile.glasses || 'none',
      hat: profile.hat || 'none',
    })
      .then(() => {
        unsub = subscribeToSocial(uid, ({ code, friends: fr }) => {
          setMyCode(code)
          setFriends(fr)
          setReady(true)
        })
      })
      .catch(() => setReady(true))
    return () => unsub && unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  // Keep my public profile + rolling stats in sync so friends see current data.
  const stats = useMemo(
    () => computeStats({ assessments, sessions, items, focusLog }),
    [assessments, sessions, items, focusLog]
  )
  const points = useMemo(
    () =>
      computePoints({
        stats,
        badgePoints: badgePointsFrom(computeBadges(stats, { weeklyGoal: settings.weeklyGoal })),
      }),
    [stats, settings.weeklyGoal]
  )
  useEffect(() => {
    if (!uid) return
    syncProfile(uid, {
      name: profile.name || 'You',
      avatar: profile.avatar,
      glasses: profile.glasses || 'none',
      hat: profile.hat || 'none',
      streak: stats.streak,
      weeklyMinutes: stats.weeklyMinutes,
      points,
    }).catch(() => {})
  }, [uid, profile.name, profile.avatar, profile.glasses, profile.hat, stats.streak, stats.weeklyMinutes, points])

  const value = {
    enabled: firebaseEnabled,
    signedIn: !!uid,
    ready,
    myCode,
    friends,
    addFriend: (code) => addFriendByCode(uid, code),
    removeFriend: (fid) => removeFriend(uid, fid),
  }
  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
}

export function useSocial() {
  const ctx = useContext(SocialContext)
  if (!ctx) throw new Error('useSocial must be used within SocialProvider')
  return ctx
}
