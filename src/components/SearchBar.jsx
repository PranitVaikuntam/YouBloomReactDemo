/**
 * Controlled and stateless — MainPage owns `query`, so there is exactly one
 * copy of the search string and no synchronisation to get wrong.
 */
export function SearchBar({ value, onChange, resultCount, totalCount }) {
  return (
    <div className="mb-6">
      <label
        htmlFor="user-search"
        className="block text-sm font-medium text-slate-700"
      >
        Search users
      </label>
      <div className="relative mt-1.5">
        <input
          id="user-search"
          type="search"
          value={value}
          // The DOM event stops at this component boundary, so MainPage reads
          // `onChange={setQuery}`.
          onChange={(e) => onChange(e.target.value)}
          placeholder="Name, username, or email"
          autoComplete="off"
          className="w-full rounded-md border border-slate-300 bg-white py-2 pr-10 pl-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {value && (
          // A real button, so it is keyboard-reachable and in the tab order.
          // type="button" is load-bearing: the default `submit` inside any
          // ancestor form would reload the page.
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            ✕
          </button>
        )}
      </div>
      {totalCount > 0 && (
        // A filter that changes the list silently for a sighted user should
        // not be silent for a screen-reader user.
        <p role="status" className="mt-2 text-sm text-slate-600">
          Showing {resultCount} of {totalCount} users
        </p>
      )}
    </div>
  )
}
