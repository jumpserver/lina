import { createXTreeDataSource } from '@/components/Tree/XTree/config'

const NODE_TREE_URL = '/api/v1/assets/nodes/children/tree/'
const NODE_ASSET_SEARCH_URL = '/api/v1/assets/node-assets/tree/search/'
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
  return createXTreeDataSource(request, {
    root: {
      url: NODE_TREE_URL,
      params: ({ assetOrder, nodeLimit }) => ({
        asset_amount: 0,
        asset_order: assetOrder,
        assets: 0,
        node_limit: nodeLimit
      })
    },
    children: {
      url: ({ next }) => (typeof next === 'string' && next ? next : NODE_TREE_URL),
      params: ({
        assetOrder,
        assetsLimit,
        includeAssets = true,
        level,
        next,
        nodeLimit,
        parent
      }) => {
        if (typeof next === 'string' && next) {
          return undefined
        }
        const assetPage = next?.phase === 'assets'
        return {
          asset_amount: 0,
          asset_order: assetOrder,
          assets: assetPage && includeAssets ? 1 : 0,
          assets_limit: assetPage && includeAssets ? assetsLimit : undefined,
          assets_offset: assetPage ? Number(next?.offset) || 0 : undefined,
          key: parent.treeKey,
          lv: level,
          node_limit: assetPage ? undefined : nodeLimit,
          nodes: assetPage ? 0 : 1
        }
      }
    },
    search: {
      url: NODE_ASSET_SEARCH_URL,
      params: ({ includeParents, keyword, limit, target }) => ({
        include_ancestors: target === 'asset' ? includeParents : undefined,
        limit,
        search: keyword,
        target
      })
    },
    metrics: {
      method: 'post',
      url: PERMISSION_METRICS_URL,
      when: ({ nodes }) => resourceItems(nodes).length > 0,
      empty: { results: [] },
      data: ({ mode, nodes }) => ({
        items: resourceItems(nodes),
        metric: mode
      })
    }
  })
}
