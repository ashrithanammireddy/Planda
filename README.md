# Planda 🐼

A study planner that turns your deadlines into an actual study plan, and makes studying social.

**Live app: [heyplanda.com](https://heyplanda.com)**

Add your tests, quizzes, and assignments, and Planda automatically builds study sessions on your calendar in the days leading up to each one, so you prepare a little each day instead of cramming. It also keeps you motivated with friends, shared goals, a grade calculator, and a focus timer.

## ✨ Features

- **Automatic study scheduling:** add a test with a due date and difficulty, and Planda spreads study sessions across the days before it.
- **Ask Planda:** a natural-language assistant. Type *"chemistry test in 10 days"* and it logs the test and builds the study plan (rule-based, works offline).
- **Calendar:** day, week, month, and year views, with color-coded classes, tasks, and events.
- **Grade calculator:** track weighted grades, run "what-if" scenarios, and calculate what you need on a final to reach a target grade.
- **Study with friends:** add friends by code or invite link, share a weekly squad goal, and compete on a live leaderboard.
- **Gamification:** badges, ranks, and school-aware streaks that don't break on weekends or holidays.
- **Focus Room:** a study timer you can attach to a class and keep running while you work.
- **Personalization:** light and dark themes, theme colors, and 18 hand-drawn animal avatars.

## 🛠️ Tech Stack

- **React 19 + Vite**, **Tailwind CSS v4**
- **Firebase** (Authentication + Cloud Firestore) for accounts and the live friends/leaderboard
- **AWS** (S3 + CloudFront) for hosting
- `date-fns`, `lucide-react`
- Planner data persists in the browser; public profiles sync via Firestore

## 🚀 Run it locally

```bash
git clone https://github.com/ashrithanammireddy/planda.git
cd planda
npm install
npm run dev      # http://localhost:5173
```

The app runs out of the box with local data. To enable sign-in and the friends/leaderboard features, create a `.env` file with your own [Firebase](https://firebase.google.com/) project config:

```
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_APP_ID=your-app-id
```

Build for production with `npm run build` (outputs to `dist/`).

## 📂 Project structure

```
src/
  components/   calendar views, modals, panels, Ask Planda, Focus Room, avatars
  lib/          study-plan generator, natural-language parser, grade engine, dates, colors
  store/        React Context stores (planner data + social)
  App.jsx       app shell, routing, and modal wiring
```

## 👋 About

Planda was created by **Ashritha Nammireddy**, a high school student, for the 2026 Congressional App Challenge. The panda logo and the handwritten "planda" wordmark are original artwork I drew by hand. I designed the product and its scheduling logic, and used AI-assisted coding to help implement and refine the app.
