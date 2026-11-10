// The two suppressions below are the hook's design, not oversights: `fetcher`
// is excluded from the effect's dependencies on purpose (see the comment where
// they are built), and the effect's opening setState is what returns the hook
// to its loading state when the deps change.
/* oxlint-disable react-hooks/exhaustive-deps */
/* oxlint-disable react/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react'

/**
 * Run `fetcher(signal)` on mount and whenever `deps` change.
 *
 * @param {(signal: AbortSignal) => Promise<unknown>} fetcher
 * @param {unknown[]} deps
 * @returns {{ data: unknown, loading: boolean, error: Error|null, refetch: () => void }}
 */
export function useFetch(fetcher, deps) {
  // loading starts true, rather than being set true by the effect: effects run
  // after the first paint, so `false` would make render 1 claim "loaded with
  // no data" and render children against data === null.
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [nonce, setNonce] = useState(0)

  // User-initiated and single-shot: one call, one request. No automatic retry,
  // budget, or backoff — that would hide failures behind silent re-requests.
  const refetch = useCallback(() => setNonce((n) => n + 1), [])

  // `fetcher` is deliberately absent from the dependencies: DetailPage passes
  // an inline arrow that is a new reference on every render, so depending on it
  // would refetch in a loop.
  const effectDeps = [...deps, nonce]

  useEffect(() => {
    const controller = new AbortController()
    // Clearing data too is what keeps the previous record from outliving the
    // URL that fetched it: DetailPage remounts nothing when :id changes, so
    // without the reset user 4's page would show user 3 for the length of the
    // request.
    setState({ data: null, loading: true, error: null })

    fetcher(controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        // Swallowed rather than written to state: a cancelled request is not a
        // failure the user should see. Works only because services/api.js
        // re-throws aborts unchanged.
        if (err.name === 'AbortError') return
        setState({ data: null, loading: false, error: err })
      })

    return () => controller.abort()
  }, effectDeps)

  return { ...state, refetch }
}
