import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_ROUTE, NAV_ITEMS } from '../config/navigation'

const VALID_ROUTES = new Set(NAV_ITEMS.map((item) => item.id))

function readRoute() {
  const id = window.location.hash.replace(/^#\/?/, '').split(/[/?]/)[0]
  return VALID_ROUTES.has(id) ? id : DEFAULT_ROUTE
}

/**
 * Minimal hash-based router: keeps views in sync with the URL so links,
 * the back button, and refreshes all work without a routing dependency.
 */
export function useHashRoute() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((id) => {
    window.location.hash = `/${id}`
  }, [])

  return [route, navigate]
}
