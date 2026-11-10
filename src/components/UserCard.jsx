import { Link } from 'react-router-dom'

export function UserCard({ user }) {
  return (
    // The whole card is the link target so the click area matches the visual
    // card.
    <Link
      to={`/users/${user.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
    >
      <p className="font-semibold text-slate-900">{user.name}</p>
      <p className="mt-1 text-sm text-slate-600">@{user.username}</p>
      <p className="truncate text-sm text-slate-600">{user.email}</p>
      <p className="mt-3 text-xs font-medium tracking-wide text-teal-700 uppercase">
        {user.company?.name ?? '—'}
      </p>
    </Link>
  )
}
