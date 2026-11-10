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

## Decisions

**Context API rather than Redux Toolkit.** The entire global state is one phone string. A store,
a slice, and a provider would be more machinery than a single `useState` needs. The task lists
Context as an equally acceptable option.

**Vitest in place of Jest.** The task permits "any preferred tool". Running Jest against Vite's
ESM pipeline needs babel and transform glue, which is config noise in a project judged on
cleanliness. Vitest's API is Jest-compatible — same `describe`/`it`/`expect`, same React Testing
Library usage.

**`/users` rather than `/posts` from jsonplaceholder.** `/posts` has 100 records, which exercises
search harder, but a post only has a title and a body. A user has name, username, email, phone,
website, a full address, and a company, so the detail page shows genuinely detailed information —
and it pairs naturally with a phone-number login.

**Any valid country code is accepted, not just `+254`.** The task says the number should start
with a country code "like +254" and gives `+254712345678` as an example of a valid number — both
are examples, not the rule. Hard-coding one string would make the validation decorative, so
`validatePhone` accepts any E.164-shaped number: a `+`, then 8–15 digits, with spaces, hyphens,
dots, and parentheses stripped first.

**The detail page fetches its own record by route param** rather than receiving it through
router state. That costs one extra request and makes deep links and reloads work.

## Known limitations

- No request timeout. A request that hangs rather than failing leaves the spinner up. Choosing a
  threshold for a 10-record demo against a public API is guesswork, and too low a value turns a
  slow connection into a false error.
- Search filters in memory and is not debounced — with 10 records it is immediate.
