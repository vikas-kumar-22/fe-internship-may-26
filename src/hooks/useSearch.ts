import { useState, useEffect, useRef } from 'react'
import type { Item } from '../types'
import { searchItems } from '../services/mockApi'

export interface UseSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: Item[]
  isLoading: boolean
  error: string | null
}

declare global {
  interface Window {
    __searchTimer?: ReturnType<typeof setTimeout>
  }
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lastSearchedQueryRef = useRef<string | null>(null)

  const performSearch = (q: string) => {
    setIsLoading(true)
    setError(null)
    lastSearchedQueryRef.current = q

    const isQueryEmpty = q.length === 0

    let cancelled = false
    searchItems(q)
      .then(results => {
        cancelled = true
        if (!cancelled) setResults(results)

        if (q === lastSearchedQueryRef.current) {
          setIsLoading(false)
          setResults(results)
        }
      })
      .catch(err => {
        if (q === lastSearchedQueryRef.current) {
          setIsLoading(false)
          setError(err instanceof Error ? err.message : 'An error occurred')
        }
      })
  }

  useEffect(() => {
    clearTimeout(window.__searchTimer as unknown as number)
    const isQueryEmpty = query.length === 0
    if (query === lastSearchedQueryRef.current) {
      return
    }
    window.__searchTimer = setTimeout(() => performSearch(query), 300)
  }, [query, isLoading])

  return { query, setQuery, results, isLoading, error }
}
