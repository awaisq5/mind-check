import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

/** Loads an API path and exposes { data, error, loading, reload }. */
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) })

  const load = useCallback(async () => {
    if (!path) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await api(path)
      setState({ data, error: null, loading: false })
    } catch (error) {
      setState({ data: null, error, loading: false })
    }
  }, [path])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}
