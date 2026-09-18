import { createNodeAssetTreeDataSource } from '@/components/Tree/NodeAssetTree/dataSource'

const PERMISSION_METRICS_URL = '/api/v1/perms/asset-permissions/tree-metrics/'

function resourceItems(nodes) {
  const seen = new Set()
  const items = []

  for (const node of nodes || []) {
    const type = node?.type
    const id = node?.resourceId
    const key = `${type}:${id}`
    if (!id || !['node', 'asset'].includes(type) || seen.has(key)) {
      continue
    }
    seen.add(key)
    items.push({ type, id })
  }
  return items
}

/**
 * Configure the shared XTree data-source contract for the admin asset and
 * permission APIs. The feature component supplies permission-specific state;
 * XTree remains the only tree renderer and loading engine.
 */
export function createAssetPermissionTreeDataSource(request) {
  return createNodeAssetTreeDataSource(request, {
    metrics: {
      method: 'post',
      url: PERMISSION_METRICS_URL,
      when: ({ nodes }) => resourceItems(nodes).length > 0,
      empty: { results: [] },
      data: ({ mode, nodes }) => ({
        resources: resourceItems(nodes),
        metric: mode
      })
    }
  })
}
