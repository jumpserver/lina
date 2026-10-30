export function agentAuditRoute(kind, id, orgId) {
  const query = orgId ? { oid: orgId } : {}
  if (id) {
    return {
      name: kind === 'sessions' ? 'AgentSessionDetail' : 'AgentActionDetail',
      params: { id },
      query
    }
  }
  return {
    name: kind === 'sessions' ? 'SessionList' : 'CommandList',
    query: { ...query, tab: kind === 'sessions' ? 'AgentSessions' : 'AgentActions' }
  }
}
