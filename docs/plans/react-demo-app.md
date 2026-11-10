# React Demo App — youbloom Technical Interview Task


## Problem

youbloom's take-home asks for a small React SPA that demonstrates idiomatic modern React:
functional components, Hooks, a real API integration, handled loading/error states, and a clean
responsive UI.

The project is **already scaffolded** — do not re-run `npm create vite`, it would clobber
working config. What exists: `package.json` (deps installed, scripts `dev`/`build`/`preview`/
`lint`/`test`/`test:watch`), `vite.config.js` (React + Tailwind plugins and the full Vitest
`test` block described below), `index.html`, `.oxlintrc.json`, `.gitignore`, and `public/`.
Git is initialised on `main` with `origin` set to
`https://github.com/PranitVaikuntam/YouBloomReactDemo.git`, but nothing is committed yet.
What does not exist: `src/` is empty and there is no `README.md`. Everything under `src/` is
built from scratch.

The brief (`React Demo App – Technical Interview Task.pdf`, at the repo root) requires three
pages — Login, Main (list with search), Detail — plus a README and at least one unit test. It is
graded on code quality and structure, not feature count, so the spec deliberately stays inside
the brief rather than adding scope.

### Requirements, verbatim in substance, from the PDF

General:
- JavaScript with React (not TypeScript).
- State via React Hooks, Context API, **or** Redux Toolkit.
- Data from a public REST API such as `https://jsonplaceholder.typicode.com`.
- Responsive, clean UI using Material UI, Tailwind CSS, or custom CSS.
- A short README explaining project setup.
- At least one unit test using Jest and React Testing Library "or any preferred tool".

Login page:
- A phone number input with basic validation — required, and starting with a country code
  "like +254".
- A login button using mock logic (the PDF gives `+254712345678` as an example of a valid
  number).
- Redirect to the Main page on success; show error messages for invalid input.

Main page:
- A list of items from a public API.
- A search bar filtering the list dynamically as the user types.
- Clicking an item opens its Detail page.

Detail page:
- Detailed information about the selected item.
- A button or link back to the Main page.

Technical guidelines:
- Functional components, clean code.
- Handle loading and error states when fetching.
- Modular file structure (components, pages, services).
- localStorage for login state (marked optional in the brief; this spec implements it).

## Technical Plan

A client-side-routed SPA with no backend of its own. Three routes:

| Route | Access | Page |
|---|---|---|
| `/login` | public | `LoginPage` |
| `/` | guarded | `MainPage` |
| `/users/:id` | guarded | `DetailPage` |

The two guarded routes are nested inside **one** `ProtectedRoute` + `Layout` pair rather than
each being wrapped individually, so the guard and the app chrome are declared once:

```jsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<ProtectedRoute />}>
    <Route element={<Layout />}>
      <Route path="/" element={<MainPage />} />
      <Route path="/users/:id" element={<DetailPage />} />
    </Route>
  </Route>
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

The `*` catch-all matters because `<Routes>` renders **nothing** when no child matches — an
unknown URL would otherwise be a blank white page with no way forward. Redirecting to `/`
sends the visitor somewhere useful (and on to `/login` if they are not authenticated), with
`replace` keeping the bad URL out of history. A dedicated `NotFound` page would be more honest
about the mistake, but it is scope the brief never asked for; with three routes there is
nowhere meaningful to get lost.

`main.jsx` mounts them in the order **`StrictMode` → `BrowserRouter` → `AuthProvider` → `App`**.
`StrictMode` is kept on deliberately: it double-invokes effects in development, so each data page
fires its request twice and aborts the first, which is noisy in the network tab but is also
exactly the behaviour the abort rules in `useFetch` and `services/api.js` exist to handle — if a
duplicate mount produced a spurious error panel, that would be a real bug worth seeing in
development rather than hiding. Production builds run effects once. `AuthProvider` sits *inside*
`BrowserRouter` so that anything it renders may use router hooks.

**Auth** is a single stored phone string. `AuthProvider` (Context API) wraps `App` and
exposes `{ phone, login, logout }`, seeding its state from `localStorage` on first render and
writing through on change, so a refresh keeps the session. Every storage call — read, write, and
clear alike — is guarded, so a browser with storage disabled loses only session persistence rather
than breaking login. `ProtectedRoute` reads the context
and redirects to `/login` when no phone is stored. It is a layout route, and inside it `Layout`
renders the header (identity + Logout) around every guarded page. No credentials are verified
against anything — login is mock logic, as the brief specifies.

**Data** comes from `https://jsonplaceholder.typicode.com/users` — 10 records, each with name,
username, email, phone, website, address (incl. city and zipcode) and company. One `useFetch`
hook returns `{ data, loading, error }` so both data pages render the same three states through
a shared `StateView` component.

**Search** filters the already-fetched array in memory on every keystroke. With 10 records,
debouncing or a server-side query would be pretend-engineering.

**Detail** fetches its own record by the `:id` route param rather than reading state passed
through the router link. This costs one extra request and makes deep links and page reloads
work.

**Phone validation** is a pure function in `src/utils/validatePhone.js`, deliberately separated
from the component so it is cleanly unit-testable and `LoginPage` stays presentational.

### Stack

Scaffolded with `npm create vite@latest . -- --template react`. Versions below are what a fresh
install resolves to as of November 2026; the majors matter, the patches do not.

| Package | Version | Role |
|---|---|---|
| `react` / `react-dom` | 19.3 | UI |
| `react-router-dom` | 7.18 | routing |
| `tailwindcss` + `@tailwindcss/vite` | 4.3 | styling |
| `vitest` + `jsdom` | 5.1 / 31 | test runner and DOM |
| `@testing-library/react` | 16.3 | component tests |
| `@testing-library/jest-dom` | 7.0 | DOM matchers |
| `@testing-library/user-event` | 14.6 | realistic typing/clicking |
| `@vitejs/plugin-react` | 6.1 | JSX transform + Fast Refresh |
| `oxlint` | 1.90 | linting (`npm run lint`) |

Two version-specific notes a fresh session will otherwise get wrong:

- **Tailwind v4 is CSS-first.** There is no `tailwind.config.js` and no `@tailwind base;`
  directives. `src/index.css` contains the single line `@import "tailwindcss";`, and the
  `@tailwindcss/vite` plugin is added to `plugins` in `vite.config.js`. v3 instructions found
  online do not apply.
- **react-router-dom v7**, not v6. Every API this spec uses — `BrowserRouter`, `MemoryRouter`,
  `Routes`, `Route`, `Link`, `Navigate`, `useNavigate`, `useParams`, `Outlet` — is unchanged
  from v6, so v6 would also work; the lockfile just resolves to v7.

## Alternatives

**Redux Toolkit instead of Context.** Rejected: the entire global state is one phone string.
RTK would add a store, slice, and provider to manage less state than a single `useState`. The
brief lists Context as an equally acceptable option. The README states this reasoning so the
choice reads as a decision, not an omission.

**Jest instead of Vitest.** Rejected: Vite's ESM pipeline needs babel/transform glue to run
Jest, which adds config noise to a project judged on cleanliness. Vitest's API is
Jest-compatible (`describe`/`it`/`expect`, same RTL usage) and the brief permits "any preferred
tool". The README notes the substitution explicitly so it isn't read as a missed requirement.

**Create React App.** Rejected: Jest and RTL work out of the box, but CRA is deprecated and
unmaintained, which is a worse signal in a code-quality review than a tooling substitution that
is documented.

**`/posts` instead of `/users`.** Rejected: 100 records exercise search harder, but the detail
page would only have a title and a body. `/users` gives a detail page with genuinely detailed
information, and pairs naturally with a phone-number login.

**Accepting only `+254712345678`.** Rejected: the PDF says the input should start with a
country code "**like** +254" and that `+254712345678` is "e.g." a valid number — both are
examples, not the rule. Hard-coding one string would make the stated validation requirement
decorative. The validator therefore accepts any E.164-shaped international number, and the
README names `+254712345678` as a known-good sample for the reviewer to type.

**Passing the selected user through router state to the detail page.** Rejected: it saves a
request but breaks deep links and refreshes, which a reviewer is likely to try.

## Detailed Implementation

### File structure

```
src/
  main.jsx                              imports index.css; StrictMode > BrowserRouter > AuthProvider
  App.jsx                               route table
  index.css                             tailwind directives
  context/authContext.js                createContext + STORAGE_KEY + useAuth (no components)
  context/AuthProvider.jsx              AuthProvider component
  components/
    ProtectedRoute.jsx
    Layout.jsx
    SearchBar.jsx
    UserCard.jsx
    StateView.jsx
  hooks/useFetch.js
  pages/
    LoginPage.jsx
    MainPage.jsx
    DetailPage.jsx
  services/api.js
  utils/validatePhone.js
  utils/__tests__/validatePhone.test.js
  pages/__tests__/LoginPage.test.jsx
  test/setup.js                         imports @testing-library/jest-dom
docs/plans/react-demo-app.md            this document
README.md
```

Vitest is configured inside `vite.config.js` rather than a separate `vitest.config.js`, via a
`test` key alongside `plugins`: `environment: 'jsdom'`, `globals: true`, and
`setupFiles: './src/test/setup.js'`. `globals: true` is what lets the test files use
`describe`/`it`/`expect` without importing them, matching Jest's ergonomics. Scripts:
`npm test` runs `vitest run` (single pass, CI-friendly); `npm run test:watch` runs `vitest`.

### `utils/validatePhone.js`

Exports `validatePhone(input)` returning `{ valid: boolean, message: string, value: string }`
(`message` is `''` when valid; `value` is `''` when invalid). It first strips spaces, hyphens,
parentheses, and dots, then applies these rules **in order**, returning on the first failure:

| Condition | `valid` | `message` |
|---|---|---|
| empty or whitespace only | `false` | `Phone number is required` |
| does not start with `+` | `false` | `Phone number must start with a country code, e.g. +254` |
| any non-digit after the `+` | `false` | `Phone number can only contain digits after the country code` |
| fewer than 8 or more than 15 digits after the `+` | `false` | `Phone number must be between 8 and 15 digits` |
| otherwise | `true` | `''` |

8–15 is the E.164 total-length range; it is what makes every country code valid rather than
only `+254`.

Dots are in the strip set alongside spaces, hyphens, and parentheses because `+254.712.345.678`
is a format people actually type, and leaving it out would route it to *`Phone number can only
contain digits after the country code`* — an error that reads as a bug, since the number is
well-formed and only the separator differs. The strip set is the whole list: anything else
between the digits (a unicode non-breaking hyphen, say) is rejected rather than silently
repaired, which keeps the normalization total and predictable instead of open-ended.

`value` is the **normalized** number — the stripped string the rules actually ran against, so
`'+254 712 345 678'` yields `'+254712345678'`. It is returned rather than discarded so that
`LoginPage` stores one canonical form regardless of how the user typed it: without it,
`localStorage` and the `Layout` header would echo whatever spacing and hyphens were entered, and
the same number typed two ways would produce two different stored values. Keeping the
normalization inside this module is also what lets `LoginPage` stay presentational — the reason
the validator was extracted in the first place.

### `context/authContext.js` and `context/AuthProvider.jsx`

Auth is **two files, not one**, and the split is a lint requirement rather than taste. The repo's
`.oxlintrc.json` enables `react/only-export-components` (warn, `allowConstantExport: true`), which
flags any module that exports both a component and a non-component value. A single
`AuthContext.jsx` exporting `AuthProvider` *and* `useAuth` is exactly that pattern, so it is split:

`context/authContext.js` — exports no components, so the rule does not apply to it:

- `STORAGE_KEY = 'youbloom.phone'`.
- `const AuthContext = createContext(null)`.
- `useAuth()`, which reads the context and throws a clear error if used outside the provider.

`context/AuthProvider.jsx` — exports the `AuthProvider` component only. It imports `AuthContext`
and `STORAGE_KEY` from `authContext.js` (one direction of import only, so there is no cycle) and
`validatePhone` from `utils/validatePhone.js`:

- **Every** `localStorage` access goes through three module-local helpers — `readPhone()`,
  `writePhone(phone)`, `clearPhone()` — each wrapping its call in try/catch and swallowing the
  failure (`readPhone` returning `null`). No bullet below touches `localStorage` directly.
  `getItem` is not the only call that throws: in Safari private mode and under a
  storage-disabled policy `setItem` throws too (`QuotaExceededError`/`SecurityError`), and so can
  `removeItem`. Guarding only the read would mean the app mounts fine and then dies inside the
  login submit handler — the crash moved rather than handled. Centralising in helpers is what
  makes "all accesses are guarded" checkable by reading one block, instead of three try/catches
  that have to be kept in sync.
- `useState` initialised lazily from `readPhone()`.
- `login(phone)` sets state, then calls `writePhone(phone)`.
- `logout()` clears state, then calls `clearPhone()`.
- In both cases **state is the source of truth and is set first**; persistence is best-effort. A
  storage failure therefore costs exactly one thing — the session does not survive a reload — and
  login, logout, the guard, and the header all keep working for the life of the tab. That, stated
  precisely, is the "degrades to an in-memory session" claim; it is only true if the writes are
  guarded as well as the read.
- `readPhone()` additionally **re-validates** what it read: it runs the stored string through
  `validatePhone` and returns `null` unless it is valid. `localStorage` is user-writable, so
  without this check any junk string — `"x"`, or a half-typed number from an older build — would
  satisfy `Boolean(phone)`, grant access to the guarded routes, and render verbatim in the
  `Layout` header. Validating on read is also what keeps the stored value canonical end to end:
  `LoginPage` only ever writes a normalized number, and anything else is discarded rather than
  trusted.
- Context value `{ phone, isAuthenticated: Boolean(phone), login, logout }`, memoised.

Every consumer (`ProtectedRoute`, `Layout`, `LoginPage`) imports `useAuth` from
`context/authContext.js`; only `main.jsx` and the `LoginPage` test import `AuthProvider`.

### `components/ProtectedRoute.jsx`

Reads `isAuthenticated`. When false, renders `<Navigate to="/login" replace />`; otherwise
renders `<Outlet />`. It takes no props and is used purely as a layout route (see the route
tree above), so the guard is declared once for both protected pages instead of being repeated
per route. `replace` keeps the guarded URL out of history so Back doesn't bounce the user
between pages.

### `components/Layout.jsx`

The chrome shared by every guarded page, rendered inside `ProtectedRoute`:

- A header with the app name, the logged-in phone from `useAuth()`, and a Logout button that
  calls `logout()` and navigates to `/login` with `replace`.
- `<Outlet />` for the page body, inside the fixed max-width container.

The header lives here rather than on `MainPage` so that Logout and the signed-in identity are
present on the detail page too — otherwise navigating into a user strands the reviewer with no
way to sign out. It takes no props and owns no state beyond what `useAuth()` gives it.

### `services/api.js`

- `const BASE_URL = 'https://jsonplaceholder.typicode.com'`.
- `getUsers(signal)` → `GET /users`; `getUser(id, signal)` → `GET /users/${id}`.
- Both check `res.ok` and throw on a non-2xx, so a bad response becomes the error state instead
  of a render crash — `fetch` does not reject on HTTP errors.
- The thrown `Error` carries the response status as a `status` property, and a 404 gets its own
  message: `getUser` throws `User not found` for a 404 and `Failed to load user` for anything
  else; `getUsers` throws `Failed to load users`. Without the status the detail page could only
  show one generic failure for both “this id does not exist” and “the network is down”, which
  are different problems for the reader and want different wording.
- Both also check the **shape** of a 2xx body before returning it, because `res.ok` only rules out
  non-2xx: `getUser` throws `User not found` unless the parsed body is an object with an `id`, and
  `getUsers` throws `Failed to load users` unless the parsed body is an array. Against the live
  jsonplaceholder API an unknown id (`/users/999`, `/users/abc` — `:id` is unconstrained, so
  non-numeric ids are reachable URLs) answers `404 {}` and the `res.ok` check already catches it;
  this guard is what keeps a `200 {}` from any proxy, cache, or captive portal in the same error
  state rather than letting `DetailPage` read `user.company.name` off `{}` and crash.
- Both pass the caller's `AbortSignal` through.
- Both wrap the `await fetch(...)` itself in try/catch, because **`fetch` rejects outright** — it
  does not produce a response — when the request never reaches the server: offline, DNS failure,
  CORS rejection, connection reset. That rejection is a `TypeError` whose message is the browser's
  own (`Failed to fetch` in Chrome, `Load failed` in Safari, `NetworkError when attempting to fetch
  resource.` in Firefox), and left alone it propagates through `useFetch` and lands verbatim in the
  error panel. The catch converts it to `Network error — could not reach the server. Check your
  connection and retry.` with `status` left `undefined`, which is what makes "this id does not
  exist" and "the network is down" actually read differently to the user rather than only in the
  code. A browser-internal string in the UI is also the single most visible tell of unhandled
  failure in a code-quality review.
- That catch **re-throws an `AbortError` untouched** (`if (err.name === 'AbortError') throw err`)
  before mapping anything else. A cancelled request rejects through the same path as a network
  failure, so a blanket conversion would disguise every abort as a network error — which `useFetch`
  would then no longer recognise to swallow, putting a spurious "could not reach the server" panel
  on screen every time the reviewer navigates away mid-request. The abort handling in `useFetch`
  depends on this re-throw.
- `await res.json()` is inside the same try/catch. A 2xx with a malformed or truncated body makes
  `json()` reject with a `SyntaxError` (`Unexpected token ... in JSON`), which is the same class of
  leak as the `fetch` rejection; it maps to the generic `Failed to load user` / `Failed to load
  users`.
- `getUser` interpolates `encodeURIComponent(id)`, not raw `id`. `:id` is unconstrained, so the
  param can arrive holding `?`, `#`, or `&` (a URL-encoded `/users/1%3Ffoo` decodes to exactly
  that), and unencoded those characters silently become query or fragment delimiters — the request
  would go to a different URL than intended and the failure would make no sense.
- **No request timeout**, deliberately: a request that hangs rather than failing leaves the spinner
  up indefinitely. `AbortSignal.timeout` would fix it in one line, but choosing a threshold for a
  10-record demo against a public API is guesswork, and a wrong one turns a slow connection into a
  false error. Recorded as a known limitation rather than left as an oversight.

### `hooks/useFetch.js`

`useFetch(fetcher, deps)` returns `{ data, loading, error, refetch }`.

`fetcher` is called as **`fetcher(controller.signal)`** — the hook creates the `AbortController`
and hands its signal to the fetcher on every run, which is why `MainPage` can pass `getUsers`
directly and `DetailPage` passes `signal => getUser(id, signal)`. Every function in
`services/api.js` takes that signal as its last parameter for exactly this reason.

**Initial state is `data = null`, `loading = true`, `error = null`** — `loading` starts `true`, it
is not merely set `true` by the effect. Effects run *after* the first paint, so a `false` initial
value would make render 1 claim "loaded with no data": `StateView` would render its children
against `data === null`. Starting `true` means the first render is the loading state, which is
also the truth of the matter — a request is about to be in flight.

`error` holds the caught **`Error` object**, not a message string, so the `status` property that
`services/api.js` attaches stays reachable to anything downstream; `StateView` renders
`error.message`. Storing the string instead would throw the status away at the only point where
the two failure kinds are still distinguishable.

`data` stays `null` rather than `[]` because `useFetch` is shared by a list page and a single-record
page; `[]` would be a lie on `DetailPage`. Consumers therefore **must** treat `data === null` as a
real case and null-guard any derived computation, even code that only runs inside `StateView`'s
children — `useMemo` bodies and other render-phase work execute on every render regardless of which
branch `StateView` picks (see `MainPage` below).

On mount and whenever `deps` change: creates an `AbortController`, sets `loading = true` and
clears **both `error` and `data`**, awaits the fetcher, then sets `data` or `error`. Clearing
`data` is what keeps the previous record from outliving the URL that fetched it: `DetailPage`
remounts nothing when `:id` changes — the same hook instance just re-runs its effect — so
without the reset, user 4's page would render user 3's name, email, and company for the length
of the request. Returning to the loading state is the honest answer to "which user is this?"
while the answer is unknown. The cleanup aborts the controller, and an `AbortError`
is swallowed rather than written to state — otherwise navigating away mid-request sets state on
an unmounted component and surfaces a spurious error. The check is `err.name === 'AbortError'`,
which works only because `services/api.js` re-throws aborts unchanged instead of folding them into
its network-error message; the two rules are a pair and changing either one breaks the other.

`refetch` is a `useCallback` that bumps an internal `nonce` counter which the effect also
depends on, so calling it re-runs the same request:

```js
const [nonce, setNonce] = useState(0)
const refetch = useCallback(() => setNonce(n => n + 1), [])
useEffect(() => { /* fetch */ }, [...deps, nonce])
```

It exists so the error state has a recovery path instead of being a dead end. It is
**user-initiated and single-shot** — one call, one request. There is deliberately no automatic
retry, no attempt budget, and no backoff: that would hide failures behind silent re-requests to
a public API and would need its own "never retry a 4xx" rule, which is config noise in a
10-record demo.

The effect's dependency array is `deps` plus `nonce`; `fetcher` is intentionally **not** a
dependency, since `DetailPage` passes an inline arrow that is a new reference on every render.
(The repo's oxlint config enables `react/rules-of-hooks` but not `exhaustive-deps`, so this
does not trip the linter.)

### `pages/LoginPage.jsx`

- Controlled `<input type="tel">`, labelled, with `autoComplete="tel"`.
- Submit via a `<form onSubmit>` so Enter works, not just a click handler on the button.
- On submit: run `validatePhone`. If invalid, store `message` in error state, render it below
  the input, and do not navigate. The input gets `aria-invalid` and `aria-describedby` pointing
  at the error node.
- If valid: call `login(result.value)` — the **normalized** number, not the raw input — and
  `navigate('/', { replace: true })`.
- Error state clears when the user edits the field.
- If already authenticated, redirect straight to `/` by **rendering `<Navigate to="/" replace />`**,
  not by calling `navigate()` from an effect. Two reasons: a declarative redirect needs no effect
  and no cleanup, and the test file mocks `useNavigate` — sending this path through the mock too
  would leave the suite asserting on the mock rather than on a redirect that actually happened.
- Placeholder text shows the `+254712345678` sample.

### `pages/MainPage.jsx`

- `useFetch(getUsers, [])`.
- Local `query` state, owned here and passed to `SearchBar` as `value` / `onChange`, along with
  `resultCount` (the filtered length) and `totalCount` (`data?.length ?? 0`) for its live region
  — see below.
- Filtering: case-insensitive `includes` over `name`, `username`, and `email`, computed with
  `useMemo` on `[data, query]`. The memo body **must** start from `data ?? []`, never bare
  `data.filter(...)`. The memo is called during every render of `MainPage`, including the first one
  where `data` is still `null` and `StateView` is showing the spinner — `StateView` guards what is
  *rendered*, not what is *computed*, so an unguarded `data.filter` is a hard TypeError on render 1
  before any fetch can resolve.
- The grid of `UserCard`s is always rendered **as `StateView`'s children**, never conditionally
  beside it — `<StateView loading={loading} error={error} onRetry={refetch}>{grid}</StateView>`.
  `StateView` owns the three-way branch (see below); `MainPage` does not re-implement it with a
  ternary. This is also why the filter memo must null-guard: the memo runs on every render of
  `MainPage`, including the renders where `StateView` shows the spinner instead of the grid.
- When the filter result is empty but data loaded, shows "No users match <query>" rather than a
  blank area.
- No header of its own — the identity and Logout controls come from `Layout`.

### `components/SearchBar.jsx`

Props: `{ value, onChange, resultCount, totalCount }`. A **controlled, stateless** input — `MainPage` owns
`query`, and `SearchBar` holds no state of its own, so there is exactly one copy of the search
string and no synchronisation to get wrong.

- `onChange` is called with the **string**, not the event: `onChange={e =>
  onChange(e.target.value)}` inside `SearchBar`, so `MainPage` reads `onChange={setQuery}` and the
  DOM event stops at the component boundary.
- `<input type="search">` with a **visible** `<label htmlFor>` ("Search users"), not a
  placeholder standing in for a label — a placeholder disappears on the first keystroke and is not
  reliably announced. `placeholder="Name, username, or email"`, which names the three fields the
  filter actually searches so the scope is discoverable rather than guessed.
- `autoComplete="off"`, and `autoFocus` is **not** set: the list is the page's primary content and
  stealing focus on mount moves a screen reader's starting point away from it.
- A clear button, rendered **only when `value` is non-empty** — a `<button type="button">` with
  `aria-label="Clear search"` calling `onChange('')`. It is a real button, not a click handler on
  an icon `<span>`, so it is keyboard-reachable and in the tab order. `type="button"` is load-
  bearing: the default `submit` inside any ancestor form would reload the page. The input also
  suppresses the browser's own clear affordance —
  `[&::-webkit-search-cancel-button]:appearance-none` — because `type="search"` draws a native
  ✕ in Chrome and Safari that would sit beside this one: two controls doing the same job, only
  one of them labelled, and only on some browsers.
- Results are announced: a `<p role="status">` (polite live region) reading
  `Showing ${resultCount} of ${totalCount} users` so a filter that changes the list silently for a
  sighted user is not silent for a screen-reader user. `MainPage` passes `resultCount` from the
  memo result and `totalCount` from `data?.length ?? 0`; announcing is the only reason the two
  props exist, and the visible empty-state text stays `MainPage`'s job. The region renders only
  once data has loaded, so it does not announce `0 of 0` under the spinner.
- No debounce and no internal `useEffect`. Filtering 10 in-memory records on keystroke is
  immediate; see **Search** in the Technical Plan.

### `components/UserCard.jsx`

A `<Link to={`/users/${user.id}`}>` wrapping name, username/email, and company name. The whole
card is the link target so the click area matches the visual card.

### `pages/DetailPage.jsx`

- `const { id } = useParams()`; `useFetch(signal => getUser(id, signal), [id])`.
- `StateView` for loading/error, passing `refetch` as `onRetry`. A nonexistent id (e.g.
  `/users/999`, or a non-numeric `/users/abc` — the route does not constrain `:id`) surfaces the
  `User not found` message from `getUser`, distinct from a generic network failure. The body-shape
  check in `getUser` is what guarantees this: a record that reaches the page always has an `id`, so
  the nested reads below cannot be reached with an empty object.
- Renders name, username, email, phone, website, company (name, catchphrase, bs) and the full
  address with city and zipcode, grouped under headings. The nested reads use optional chaining
  (`user.company?.name`, `user.address?.city`) with an em-dash fallback for a missing value —
  belt-and-braces behind `getUser`'s shape check, since a partial record should render as a record
  with gaps, not as a blank screen.
- A `<Link to="/">` "Back to list" control rendered above the content, present in the error
  state too so a bad id is not a dead end.

### `components/StateView.jsx`

Takes `{ loading, error, onRetry, children }`. It branches in exactly that order — `loading`
first, then `error`, then `children` — so a retry that is already in flight shows the spinner
rather than leaving the stale error panel up beside it. Renders a spinner/skeleton **plus the
text `Loading…`** while loading, an error panel with `error.message` (the prop is an `Error`, not
a string) and a Retry button on error, and `children` otherwise —
keeping the three-state branching out of both pages. The loading text is load-bearing, not
decoration: the loading branch is a `<p role="status">`, and a live region whose only content is
a CSS-animated `<div>` has no accessible name and announces nothing — the role would be
decorative. Rendering it visibly next to the spinner is simplest; `sr-only` is equally fine. The
error panel is `role="alert"`, so a state change that is obvious visually is announced
too — the same reason `SearchBar` has a live region and `LoginPage` wires
`aria-invalid`/`aria-describedby`. `alert` rather than `status` for the error because a failed
fetch should interrupt; a spinner should not. The Retry button calls `onRetry`, which
both pages wire to the `refetch` returned by `useFetch`. When `onRetry` is omitted the button is
not rendered at all, so the panel never shows a control that does nothing.

### Assets and `index.html`

`index.html` is scaffolded but its favicon link points at `/vite.svg`, which does not exist in
`public/` — fix the link to `/favicon.svg`, the icon that is actually there. The `<title>` is
already `youbloom — React Demo App` and needs no change.

`public/icons.svg` is a leftover social-media sprite (bluesky and friends) from the scaffold.
Nothing in this app references it; **delete it** rather than shipping a dead asset into a
code-quality review.

### Styling

`src/index.css` is one line — `@import "tailwindcss";` — with the `@tailwindcss/vite` plugin
registered in `vite.config.js` (see the Stack note on Tailwind v4).

The requirements are structural: mobile-first, single-column list on small screens and a 2–3
column grid from `md:` up, a fixed max-width container, a consistent spacing scale, and a visible
focus ring on every interactive element. Those are the parts the brief's "responsive, clean UI"
is actually judged on, and they are not negotiable.

**The visual palette, type scale, and card and header treatment are the implementer's choice.**
This spec deliberately does not name colours or tokens. Tailwind's default scales are already a
coherent design system, picking one accent and using it consistently is a two-minute decision at
the keyboard, and a spec-mandated palette would be an opinion dressed as a requirement. An
implementer who stays inside the structural rules above and applies one accent colour
consistently has met this section in full — there is no further visual bar being withheld here.

### Tests

**`utils/__tests__/validatePhone.test.js`** — table-driven over every rule above:
`''`, `'   '`, `'0712345678'` (no `+`), `'+254abc1234'`, `'+2547'` (too short),
a 16-digit number (too long), `'+254712345678'` (valid), `'+14155552671'` (valid — pins that
non-Kenyan country codes pass), `'+254 712 345 678'` (valid — pins space stripping), and
`'+254.712.345.678'` (valid — pins dot stripping, the separator most easily dropped from the
strip set by someone refactoring the regex).
Each case asserts `valid` and the exact `message`; the valid cases additionally assert `value`,
and both separator cases assert `value === '+254712345678'` so the normalization is pinned rather
than only its pass/fail.

**Isolation.** Both suites run against jsdom's **real** `localStorage`, which persists across
tests inside a file, and `AuthProvider` reads it on mount. The `LoginPage` file therefore needs

```js
beforeEach(() => { localStorage.clear(); navigateMock.mockClear() })
```

Without it the two cases below are order-coupled: case 2 submits a valid number, which calls
`login()` and writes `youbloom.phone`. On a later test in the same file `AuthProvider` would seed
from that value and `LoginPage`'s "if already authenticated, redirect straight to `/`" branch would
render a redirect instead of the form, so the queries would fail for reasons that have nothing to do
with the behaviour under test. Each test must start logged out.

**`pages/__tests__/LoginPage.test.jsx`** — renders `LoginPage` inside `MemoryRouter` and
`AuthProvider`, with `useNavigate` mocked via a **partial** mock — the factory must spread
`await vi.importActual('react-router-dom')` and override only `useNavigate`, since a bare
factory would also stub out `MemoryRouter` and `Navigate` and break the render:

```js
const navigateMock = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => navigateMock,
}))
```

`navigateMock` **must** be declared with `vi.hoisted`, not as a plain top-level `const`. `vi.mock`
is hoisted to the top of the file and its factory runs when `react-router-dom` is first imported —
which happens while the test file's own `import` statements are being resolved, *before* any
top-level statement in the file body executes. A plain `const` is therefore still in its temporal
dead zone when the factory reads it, and the suite dies on import with `Cannot access
'navigateMock' before initialization` rather than failing a test. `vi.hoisted` lifts the
initialiser to run alongside the hoisted `vi.mock`, which is what makes the reference valid.

1. Typing `0712345678` and submitting renders the country-code error and does not navigate.
2. Typing `+254712345678` and submitting navigates to `/`.
Queries use accessible roles/labels (`getByRole('textbox')`, `getByRole('button', { name: /log
in/i })`), not test ids.

### README.md

Prerequisites (**Node 22+** — the installed `vitest@5` declares
`engines: ^22.12.0 || ^24.0.0 || >=26.0.0` and `vite@8` declares `^20.19.0 || >=22.12.0`, so
Node 18 and 20 cannot run the test suite), `npm install`, `npm run dev`, `npm test`,
`npm run lint`, `npm run build`. A features
section mapping each brief requirement to where it lives. A short "Decisions" section covering:
Context over Redux Toolkit, Vitest in place of Jest, `/users` as the data source, and that any
valid country code is accepted with `+254712345678` given as a sample login.

### Submission

The brief requires the code be submitted **via GitHub (preferred) or as a ZIP file**. The repo
is already initialised on `main` with `origin` pointing at
`https://github.com/PranitVaikuntam/YouBloomReactDemo.git`; nothing has been committed. After
the app builds and the tests pass: stage everything (`.gitignore` already covers `node_modules`
and `dist`), make the initial commit including `README.md` and this plan, and
`git push -u origin main`.

**The brief PDF is not committed.** `React Demo App – Technical Interview Task.pdf` sits untracked
at the repo root, and `git add -A` would otherwise sweep youbloom's own document into a public
repo. `.gitignore` **already carries the rule that prevents this** — `*.pdf`, under the comment
`# Task brief — the grader's own document, not part of the deliverable`. Nothing needs adding;
do not add a second rule. What is still required is the check: run `git status --short` before
committing and confirm no `.pdf` is staged, since redistributing the hiring brief is the
reviewer's call to make, not ours, and the repo should contain the deliverable and nothing else.

This is a graded deliverable, not housekeeping — unsubmitted code scores zero regardless of
quality.

## Done when

- `npm run dev` serves the app; visiting `/` while logged out redirects to `/login`.
- `abc`, `0712345678`, and `+2547` each produce their specific error message and no navigation.
- `+254712345678` logs in and lands on the list; a reload keeps the session.
- With storage blocked (DevTools → Application → Storage, or a Safari private window), login still
  reaches the list and Logout still works — only the reload-survives-session behaviour is lost, and
  nothing throws.
- Setting `youbloom.phone` to a junk value by hand and reloading lands on `/login`, not on the list
  with junk in the header.
- Typing in search narrows the list per keystroke; a no-match query shows the empty state.
- Clicking a user opens the detail page; Back returns to the list; loading the detail URL
  directly renders correctly.
- Offline throttling on reload shows **the app's own wording** — `Network error — could not reach
  the server. Check your connection and retry.` — not `Failed to fetch` or any other
  browser-supplied string. Check the rendered text, not just that a panel appeared: an unhandled
  rejection also produces a panel, which is why this needs asserting on the message.
- Navigating from the list into a user and straight back while the detail request is still in
  flight leaves no error panel behind (the abort is swallowed, not mapped to a network error).
- Offline throttling on reload shows the error state, not a blank page; going back online and
  clicking Retry loads the data without a page reload.
- `npm test` passes both suites, and `npm run lint` is clean in the strict sense: **exit 0 with
  no output at all**, not merely exit 0. `oxlint` exits 0 on warnings, so a `react/only-export-
  components` warning would pass a naive check while still being a finding in a code-quality
  review; the auth-file split above exists to keep this line true.
- `/users/999` and `/users/abc` both show `User not found` — not a generic network failure, and
  not a crash on a nested field.
- Navigating from one user's detail page straight to another's shows the loading state, never the
  previous user's details under the new URL.
- The repo is initialised, committed, and pushed to GitHub (see Submission).
