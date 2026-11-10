import { Link, useParams } from 'react-router-dom'
import { StateView } from '../components/StateView.jsx'
import { useFetch } from '../hooks/useFetch.js'
import { getUser } from '../services/api.js'

const DASH = '—'

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-slate-900">{children || DASH}</dd>
    </div>
  )
}

export function DetailPage() {
  const { id } = useParams()
  const { data: user, loading, error, refetch } = useFetch(
    (signal) => getUser(id, signal),
    [id],
  )

  return (
    <>
      {/* Rendered above the content and present in the error state too, so a
          bad id is not a dead end. */}
      <Link
        to="/"
        className="inline-block text-sm font-medium text-teal-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        ← Back to list
      </Link>

      <div className="mt-4">
        <StateView loading={loading} error={error} onRetry={refetch}>
          {user && (
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <h1 className="text-2xl font-semibold tracking-tight">
                {user.name}
              </h1>
              <p className="mt-1 text-slate-600">@{user.username}</p>

              <section className="mt-6">
                <h2 className="text-sm font-semibold text-slate-900">
                  Contact
                </h2>
                <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Email">{user.email}</Field>
                  <Field label="Phone">{user.phone}</Field>
                  <Field label="Website">{user.website}</Field>
                </dl>
              </section>

              <section className="mt-6 border-t border-slate-200 pt-6">
                <h2 className="text-sm font-semibold text-slate-900">
                  Address
                </h2>
                {/* Optional chaining behind getUser's shape check: a partial
                    record should render as a record with gaps. */}
                <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Street">{user.address?.street}</Field>
                  <Field label="Suite">{user.address?.suite}</Field>
                  <Field label="City">{user.address?.city}</Field>
                  <Field label="Zipcode">{user.address?.zipcode}</Field>
                </dl>
              </section>

              <section className="mt-6 border-t border-slate-200 pt-6">
                <h2 className="text-sm font-semibold text-slate-900">
                  Company
                </h2>
                <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Name">{user.company?.name}</Field>
                  <Field label="Catchphrase">
                    {user.company?.catchPhrase}
                  </Field>
                  <Field label="Business">{user.company?.bs}</Field>
                </dl>
              </section>
            </article>
          )}
        </StateView>
      </div>
    </>
  )
}
