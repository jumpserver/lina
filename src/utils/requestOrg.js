export function getRequestOrgId(route, currentOrgId, hash = '') {
  if (route?.query?.oid) return route.query.oid
  // On a direct detail link, profile/menu requests run before the router has
  // finished its first navigation. Use the destination organization then too.
  if (!route?.matched?.length) {
    const index = hash.indexOf('?')
    const query = index < 0 ? '' : hash.slice(index + 1).split('#')[0]
    const initialOrgId = new URLSearchParams(query).get('oid')
    if (initialOrgId) return initialOrgId
  }
  return currentOrgId
}
