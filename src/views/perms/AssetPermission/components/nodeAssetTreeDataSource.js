const NODE_TREE_URL = '/api/v1/assets/nodes/children/tree/'
const NODE_ASSET_SEARCH_URL = '/api/v1/assets/node-assets/tree/search/'
const ASSET_METRICS_URL = '/api/v1/assets/nodes/tree-metrics/'
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
 * Map the reusable NodeAssetTree provider contract to the admin asset and
 * permission APIs. Keeping this adapter on the page boundary allows workbench
 * and Luna trees to reuse the component with their own permission-aware APIs.
 */
export function createAssetPermissionTreeDataSource(request) {
  return {
    root({ assetOrder, assetsLimit, signal } = {}) {
      return request.get(NODE_TREE_URL, {
        params: {
          asset_amount: 0,
          asset_order: assetOrder,
          assets: 1,
          assets_limit: assetsLimit
        },
        signal
      })
    },
    children({ assetOrder, assetsLimit, level, parent, signal }) {
      return request.get(NODE_TREE_URL, {
        params: {
          asset_amount: 0,
          asset_order: assetOrder,
          assets: 1,
          assets_limit: assetsLimit,
          key: parent.treeKey,
          lv: level
        },
        signal
      })
    },
    search({ keyword, limit, scopeNodeId, signal, target }) {
      return request.get(NODE_ASSET_SEARCH_URL, {
        params: {
          limit,
          node_id: scopeNodeId || undefined,
          search: keyword,
          target
        },
        signal
      })
    },
    metrics({ fresh, mode, nodes, search, signal }) {
      const items = resourceItems(nodes)
      if (!items.length) {
        return { results: [] }
      }

      if (mode === 'permission_direct' || mode === 'permission_effective') {
        return request.post(PERMISSION_METRICS_URL, { items, metric: mode }, { signal })
      }

      return request.post(
        ASSET_METRICS_URL,
        {
          fresh,
          items,
          metric: mode,
          node_id: mode === 'search_assets' ? search?.scopeNodeId || undefined : undefined,
          search: mode === 'search_assets' ? search?.keyword : undefined
        },
        { signal }
      )
    }
  }
}
