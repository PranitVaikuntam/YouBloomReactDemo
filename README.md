# youbloom — React Demo App

A small React single-page app built for the youbloom technical interview task: a mock
phone-number login, a searchable list of users from a public REST API, and a detail page per
user.

## Prerequisites

**Node 22 or newer.** The installed `vitest@5` declares
`engines: ^22.12.0 || ^24.0.0 || >=26.0.0` and `vite@8` declares `^20.19.0 || >=22.12.0`, so
Node 18 and 20 cannot run the test suite.

## Setup

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm test         # run the unit tests once
npm run test:watch
npm run lint     # oxlint
npm run build    # production build into dist/
npm run preview  # serve the production build
```

### Logging in

Any valid international number works. `+254712345678` is a known-good sample.

## Features

| Requirement | Where it lives |
| --- | --- |
| Login page, phone input with validation | `src/pages/LoginPage.jsx`, `src/utils/validatePhone.js` |
| Mock login, redirect on success, error messages | `src/pages/LoginPage.jsx` |
| Login state in `localStorage` (survives reload) | `src/context/AuthProvider.jsx` |
| Route guard for authenticated pages | `src/components/ProtectedRoute.jsx` |
| Shared header with identity and Logout | `src/components/Layout.jsx` |
| List of items from a public API | `src/pages/MainPage.jsx`, `src/services/api.js` |
| Search bar filtering the list as you type | `src/components/SearchBar.jsx`, filter in `MainPage` |
| Detail page with a link back to the list | `src/pages/DetailPage.jsx` |
| Loading and error states, with retry | `src/hooks/useFetch.js`, `src/components/StateView.jsx` |
| Responsive UI | Tailwind CSS v4, mobile-first, 1 → 2 → 3 column grid |
| Unit tests | `src/utils/__tests__/`, `src/pages/__tests__/` |

### Structure

```
src/
  main.jsx          StrictMode > BrowserRouter > AuthProvider > App
  App.jsx           route table
  components/       ProtectedRoute, Layout, SearchBar, UserCard, StateView
  context/          auth context + provider
  hooks/            useFetch
  pages/            LoginPage, MainPage, DetailPage
  services/         api.js — the only module that knows the API
  utils/            validatePhone
```

The full design rationale is in [`docs/plans/react-demo-app.md`](docs/plans/react-demo-app.md).

