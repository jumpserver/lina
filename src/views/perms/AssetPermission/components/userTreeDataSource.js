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
  return {
    root({ signal } = {}) {
      return request.get(USER_TREE_URL, { signal })
    },
    children({ limit, offset, order, parent, signal }) {
      return request.get(USER_TREE_URL, {
        params: {
          limit,
          offset,
          order,
          parent_id: parent.resourceId,
          parent_type: parent.type
        },
        signal
      })
    },
    search({ keyword, limit, order, signal }) {
      return request.get(USER_TREE_URL, {
        params: {
          limit,
          order,
          search: keyword
        },
        signal
      })
    },
    metrics({ mode, nodes, signal }) {
      const items = resourceItems(nodes)
      if (!items.length) {
        return { results: [] }
      }
      return request.post(PERMISSION_METRICS_URL, { items, metric: mode }, { signal })
    }
  }
}
