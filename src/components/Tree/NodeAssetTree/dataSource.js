import { createXTreeDataSource } from '@/components/Tree/XTree/config'
import { getNodeAssetPageParams } from './pagination'

const NODE_TREE_URL = '/api/v1/assets/nodes/children/tree/'
const NODE_ASSET_SEARCH_URL = '/api/v1/assets/node-assets/tree/search/'

export function createNodeAssetTreeDataSource(request, { metrics } = {}) {
  return createXTreeDataSource(request, {
    root: {
      url: NODE_TREE_URL,
      params: (payload) => getNodeAssetPageParams(payload)
    },
    children: {
      url: NODE_TREE_URL,
      params: ({ parent, ...payload }) =>
        getNodeAssetPageParams({ ...payload, parentKey: parent.treeKey })
    },
    search: {
      url: NODE_ASSET_SEARCH_URL,
      params: ({ includeParents, keyword, limit, target }) => ({
        ...(target === 'asset' && includeParents === false ? { include_ancestors: false } : {}),
        ...(limit !== 1000 ? { limit } : {}),
        search: keyword,
        target
      })
    },
    metrics
  })
}
