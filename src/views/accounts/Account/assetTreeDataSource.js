import { createNodeAssetTreeDataSource } from '@/components/Tree/NodeAssetTree/dataSource'

function resourceItems(nodes = []) {
  const resources = new Map()
  for (const { type, resourceId } of nodes) {
    if (resourceId && ['node', 'asset'].includes(type)) {
      resources.set(`${type}:${resourceId}`, { type, id: resourceId })
    }
  }
  return [...resources.values()]
}

export function createAccountAssetTreeDataSource(request) {
  return createNodeAssetTreeDataSource(request, {
    metrics: {
      method: 'post',
      url: '/api/v1/accounts/accounts/tree-metrics/',
      when: ({ nodes }) => resourceItems(nodes).length > 0,
      empty: { results: [] },
      data: ({ mode, nodes }) => {
        const resources = resourceItems(nodes)
        return {
          resources,
          ...(mode === 'account_direct' && resources.some(({ type }) => type === 'node')
            ? { include_descendants: false }
            : {})
        }
      }
    }
  })
}
