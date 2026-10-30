export function redirectLegacyMCPSettings(to) {
  if (typeof to.query.tab === 'string' && to.query.tab.toLowerCase() === 'mcp') {
    return {
      path: '/settings/chat-ai',
      query: { ...to.query, tab: 'MCP' },
      hash: to.hash,
      replace: true
    }
  }
}
