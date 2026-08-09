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
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!firebaseEnabled || !auth) return
    return onAuthStateChanged(auth, (u) => setUid(u?.uid || null))
  }, [])

  useEffect(() => {
    if (!uid) {
      setMyCode(null)
      setFriends([])
      setReady(false)
      setError(null)
      return
    }
    let unsub
    setError(null)
    ensureUserDoc(uid, {
      name: profile.name || 'You',
      avatar: profile.avatar,
      glasses: profile.glasses || 'none',
      hat: profile.hat || 'none',
    })
      .then(() => {
        unsub = subscribeToSocial(
          uid,
          ({ code, friends: fr }) => {
            setMyCode(code)
            setFriends(fr)
            setReady(true)
          },
          (err) => {
            console.error('[Planda social] snapshot error:', err?.code, err?.message)
            setError(err?.code || err?.message || 'error')
            setReady(true)
          }
        )
      })
      .catch((err) => {
        console.error('[Planda social] setup error:', err?.code, err?.message)
        setError(err?.code || err?.message || 'error')
        setReady(true)
      })
    return () => unsub && unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  // Keep my public profile + rolling stats in sync so friends see current data.
  const stats = useMemo(
    () => computeStats({ assessments, sessions, items, focusLog }),
    [assessments, sessions, items, focusLog]
  )
  const badges = useMemo(
    () => computeBadges(stats, { weeklyGoal: settings.weeklyGoal, friends }),
    [stats, settings.weeklyGoal, friends]
  )
  const points = useMemo(
    () => computePoints({ stats, badgePoints: badgePointsFrom(badges) }),
    [stats, badges]
  )
  const shareStats = settings.shareStats !== false
  // Earned badge ids + their tier, so a friend's card can render your medals.
  const earnedBadges = useMemo(
    () => badges.filter((b) => b.earned).map((b) => b.id),
    [badges]
  )
  const badgeTiers = useMemo(
    () => Object.fromEntries(badges.filter((b) => b.earned).map((b) => [b.id, b.tier])),
    [badges]
  )
  const badgeKey = earnedBadges.join(',')

  useEffect(() => {
    if (!uid || !myCode) return // wait until the profile doc + code exist
    // Identity always syncs; study data only when sharing is on.
    syncProfile(uid, {
      name: profile.name || 'You',
      avatar: profile.avatar,
      glasses: profile.glasses || 'none',
      hat: profile.hat || 'none',
      sharing: shareStats,
      goal: settings.weeklyGoal || 0,
      streak: shareStats ? stats.streak : 0,
      weeklyMinutes: shareStats ? stats.weeklyMinutes : 0,
      points: shareStats ? points : 0,
      badges: shareStats ? earnedBadges : [],
      badgeTiers: shareStats ? badgeTiers : {},
    }).catch(() => {})
  }, [uid, myCode, profile.name, profile.avatar, profile.glasses, profile.hat, shareStats, settings.weeklyGoal, stats.streak, stats.weeklyMinutes, points, badgeKey])

  const value = {
    enabled: firebaseEnabled,
    signedIn: !!uid,
    ready,
    error,
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
