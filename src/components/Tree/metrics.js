export const NODE_TREE_METRICS_URL = '/api/v1/assets/nodes/tree-metrics/'
const TYPE_TREE_URL = '/api/v1/assets/nodes/category/tree/'

export function nodeAssetMetricsPayload(
  nodeIds,
  { fresh = false, includeDescendants = true } = {}
) {
  return {
    resources: [...new Set(nodeIds)].map((id) => ({ type: 'node', id })),
    metric: includeDescendants ? 'asset_all' : 'asset_direct',
    ...(fresh ? { fresh: true } : {})
  }
}

export function typeTreeStructureUrl(url) {
  const [path, query] = url.split('?')
  if (path !== TYPE_TREE_URL) return url
  const params = new URLSearchParams(query)
  params.set('count_resource', 'none')
  return `${path}?${params}`
}

export function createTypeTreeMetricsLoader(request, url, countResource = 'asset') {
  if (url.split('?')[0] !== TYPE_TREE_URL || countResource === 'none') return undefined
  return (_nodeIds, { nodes = [], signal }) => {
    const resources = new Map()
    for (const node of nodes) {
      const type = node.meta?.type
      if (!['category', 'type', 'platform'].includes(type)) continue
      const id = String(node.id)
      resources.set(`${type}:${id}`, { type, id })
    }
    if (!resources.size) return { results: [] }
    return request.post(
      '/api/v1/assets/nodes/category/tree-metrics/',
      {
        resources: [...resources.values()],
        ...(countResource === 'account' ? { count_resource: 'account' } : {})
      },
      { signal }
    )
  }
}
