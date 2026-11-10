import { useMemo, useState } from 'react'
import { SearchBar } from '../components/SearchBar.jsx'
import { StateView } from '../components/StateView.jsx'
import { UserCard } from '../components/UserCard.jsx'
import { useFetch } from '../hooks/useFetch.js'
import { getUsers } from '../services/api.js'

export function MainPage() {
  const { data, loading, error, refetch } = useFetch(getUsers, [])
  const [query, setQuery] = useState('')

  // Must start from `data ?? []`: this memo runs on every render of MainPage,
  // including the first one where data is still null and StateView is showing
  // the spinner. StateView guards what is rendered, not what is computed.
  const filtered = useMemo(() => {
    const users = data ?? []
    const needle = query.trim().toLowerCase()
    if (!needle) return users
    return users.filter((user) =>
      [user.name, user.username, user.email].some((field) =>
        String(field ?? '').toLowerCase().includes(needle),
      ),
    )
  }, [data, query])

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      <p className="mt-1 mb-6 text-sm text-slate-600">
        Pick anyone to see their full details.
      </p>

      <SearchBar
        value={query}
        onChange={setQuery}
        resultCount={filtered.length}
        totalCount={data?.length ?? 0}
      />

      {/* The grid is always StateView's children, never a ternary beside it. */}
      <StateView loading={loading} error={error} onRetry={refetch}>
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
            No users match “{query}”
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((user) => (
              <li key={user.id}>
                <UserCard user={user} />
              </li>
            ))}
          </ul>
        )}
      </StateView>
    </>
  )
}
