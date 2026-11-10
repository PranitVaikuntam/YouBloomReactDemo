/**
 * The three-state branch shared by both data pages: loading, then error, then
 * children — in that order, so a retry already in flight shows the spinner
 * instead of leaving the stale error panel up beside it.
 */
export function StateView({ loading, error, onRetry, children }) {
  if (loading) {
    return (
      // The text is load-bearing: a live region whose only content is an
      // animated div has no accessible name and announces nothing.
      <p role="status" className="flex items-center gap-3 py-12 text-slate-600">
        <span
          aria-hidden="true"
          className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600"
        />
        Loading…
      </p>
    )
  }

  if (error) {
    return (
      // `alert` rather than `status`: a failed fetch should interrupt.
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
      >
        <p className="font-medium">{error.message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  return children
}
