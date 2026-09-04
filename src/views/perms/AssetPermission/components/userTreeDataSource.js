import { createXTreeDataSource } from '@/components/Tree/XTree/config'

const USER_TREE_URL = '/api/v1/users/users-groups/tree/'
const PERMISSION_METRICS_URL = '/api/v1/perms/asset-permissions/tree-metrics/'

function resourceItems(nodes) {
  const seen = new Set()
  const items = []

  for (const node of nodes || []) {
    const type = node?.type
    const id = node?.resourceId
    const key = `${type}:${id}`
    if (!id || !['organization', 'user_group', 'user'].includes(type) || seen.has(key)) {
      continue
    }
    seen.add(key)
    items.push({ type, id })
  }
  return items
}

export function createAssetPermissionUserTreeDataSource(request) {
  return createXTreeDataSource(request, {
    root: USER_TREE_URL,
    children: {
      url: USER_TREE_URL,
      params: ({ limit, offset, order, parent }) => ({
        limit,
        offset,
        order,
        parent_id: parent.resourceId,
        parent_type: parent.type
      })
    },
    search: {
      url: USER_TREE_URL,
      params: ({ keyword, limit, order }) => ({
        limit,
        order,
        search: keyword
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
