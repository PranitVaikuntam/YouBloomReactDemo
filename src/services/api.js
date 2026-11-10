const BASE_URL = 'https://jsonplaceholder.typicode.com'

const NETWORK_ERROR =
  'Network error — could not reach the server. Check your connection and retry.'

function fail(message, status) {
  const error = new Error(message)
  // The status keeps "this id does not exist" distinguishable from "the
  // network is down" downstream.
  error.status = status
  return error
}

/**
 * Fetch JSON, converting every failure mode into an Error with a message this
 * app chose. fetch rejects outright (never producing a response) when the
 * request does not reach the server, and its TypeError message is the
 * browser's own — left alone it would land verbatim in the error panel.
 */
async function fetchJson(path, signal, genericMessage) {
  let res
  let body
  try {
    res = await fetch(`${BASE_URL}${path}`, { signal })
    if (!res.ok) throw fail(genericMessage, res.status)
    // A 2xx with a malformed body makes json() reject with a SyntaxError —
    // the same class of leak as the fetch rejection.
    body = await res.json()
  } catch (err) {
    // An abort rejects through this same path. It must be re-thrown unchanged:
    // useFetch recognises it by name to swallow it, and folding it into the
    // network message would put a spurious error panel on screen every time
    // the user navigates away mid-request.
    if (err.name === 'AbortError') throw err
    if (err instanceof TypeError) throw fail(NETWORK_ERROR, undefined)
    if (err.status !== undefined) throw err
    throw fail(genericMessage, undefined)
  }
  return body
}

export async function getUsers(signal) {
  const body = await fetchJson('/users', signal, 'Failed to load users')
  // res.ok only rules out non-2xx; a 200 from a proxy or captive portal can
  // still carry the wrong shape.
  if (!Array.isArray(body)) throw fail('Failed to load users', undefined)
  return body
}

export async function getUser(id, signal) {
  // :id is unconstrained, so the param can hold ? # or &, which unencoded
  // would silently become query or fragment delimiters.
  const path = `/users/${encodeURIComponent(id)}`
  let body
  try {
    body = await fetchJson(path, signal, 'Failed to load user')
  } catch (err) {
    if (err.status === 404) throw fail('User not found', 404)
    throw err
  }
  if (!body || typeof body !== 'object' || body.id === undefined) {
    throw fail('User not found', undefined)
  }
  return body
}

// No request timeout, deliberately: AbortSignal.timeout would be one line, but
// picking a threshold for a 10-record demo against a public API is guesswork
// and a wrong one turns a slow connection into a false error. A request that
// hangs rather than failing leaves the spinner up — a known limitation.
