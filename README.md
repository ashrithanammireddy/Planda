# 📅 Planda

An AI-powered study planner that keeps you organized, focused, and stress-free.
Add your tests, quizzes, and exams, and Planda automatically lays out daily
study sessions leading up to each due date — all on a clean, customizable
calendar.

> A faithful, fully local recreation of the Planda app. No backend required —
> everything persists to your browser's `localStorage`.

## ✨ Features

- **Four calendar views** — Day, Week, Month, and Year, with quick navigation
  and a "Today" jump.
- **Assessments** — create tests, quizzes, exams, or projects with a class, due
  date, difficulty, daily study minutes, topics, notes, and a custom color.
- **Auto-generated study plans** — study sessions are spread across the days
  before an assessment, scaled by its difficulty, and rotate through your topics.
- **Upcoming Assessments panel** — see what's next with day-countdowns.
- **AI Study Helper** — a built-in (offline, rule-based) study assistant that
  reads your real assessments and suggests plans, practice questions, and
  topic reviews.
- **Settings & Theme** — light / dark / auto appearance, custom background
  color, default view, 12/24-hour time, week-start day, show/hide completed
  tasks, class management (with colors), and per-type assessment emojis.
- **Task tracking** — tick off study sessions and topic tasks; progress shows in
  the week view.

## 🛠️ Tech Stack

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [date-fns](https://date-fns.org/) for date math
- [lucide-react](https://lucide.dev/) icons
- State via React Context + `localStorage` (no server)

## 🚀 Getting Started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## 📂 Project Structure

```
src/
  components/   # Header, calendar views, modals, panels, FAB
  lib/          # date helpers, study-plan generator, AI stub, colors, constants
  store/        # Context store with localStorage persistence
  App.jsx       # app shell + view routing + modal wiring
```

## 🧠 The "AI"

The Study Assistant is intentionally **stubbed** — a local, rule-based generator
in [`src/lib/aiStub.js`](src/lib/aiStub.js). It inspects your assessments and
returns helpful canned responses, so the app works with zero API keys and no
cost. To wire in a real model, swap `assistantReply()` for an API call.

---

Built as a recreation exercise. Study data lives only in your browser.
