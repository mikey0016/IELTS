# IELTS Master 🎓

A modern, professional and fully responsive IELTS Preparation Platform.

Built with **React 18 + TypeScript + Tailwind CSS v4 + Vite**.

## Features

- **Landing page** — hero, skills, how it works, features, stats, testimonials, pricing, FAQ, footer
- **Student dashboard** — goals, progress, band estimate, continue learning, weekly activity, achievements
- **Practice** — Listening / Reading / Writing / Speaking exercises with filters, timer, scoring and explanations
- **Mock tests** — full Academic & General timed tests with results and band estimation
- **Vocabulary** — flashcards with spaced-repetition review (Again / Hard / Good / Easy)
- **Writing practice** — Task 1 & Task 2 with word counter, timer and AI-style evaluation (mocked)
- **Speaking practice** — Part 1 / 2 / 3 with prep timer and record UI
- **Study plan** — personalized weekly plan generator
- **Progress & analytics** — charts, insights, mock test history
- **Achievements** — gamified goals
- **Authentication** — sign up, login, forgot password, Google login (mocked UI)
- **Light & dark mode**, fully responsive, accessible

## Getting started

```bash
npm install
npm run dev
```

## Commands

| Command          | Description                |
| ---------------- | -------------------------- |
| `npm run dev`    | Start dev server (5173)    |
| `npm run build`  | Production build           |
| `npm run preview`| Preview production build   |

## Demo account

Use the pre-seeded account on the login page:
**alex@ieltsmaster.com** / **demo1234**

Store users are saved in `localStorage`. Switch the mock API layer (`src/api`) with real endpoints later by implementing the same interfaces.

## Structure

```
src/
├── api/         # Mock API layer (swap with real backend later)
├── components/
│   ├── charts/  # SVG charts (donut, bars, lines)
│   ├── layout/  # Navbar, Footer, Sidebar, Topbar
│   └── ui/      # Button, Card, Modal, Input, etc.
├── context/     # Theme, Auth, Toast, Progress
├── data/        # Mock content (questions, tests, vocab, ...)
├── hooks/       # useTimer, useLocalStorage, useMediaQuery
├── lib/         # helpers (cn, format, bands, storage)
└── pages/       # Route pages
```