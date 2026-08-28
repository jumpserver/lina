/**
 * Public metric identifiers understood by NodeAssetTree data sources.
 *
 * `search_assets` is transient: the component selects it automatically while
 * an asset search is active and restores the user's configured mode afterward.
 */
export const NODE_ASSET_METRIC_MODES = Object.freeze([
  'asset_all',
  'asset_direct',
  'permission_direct',
  'permission_effective'
])

export const NODE_ASSET_SEARCH_TARGETS = Object.freeze(['all', 'node', 'asset'])

function unwrapResults(response) {
  if (Array.isArray(response)) {
    return response
  }
  if (Array.isArray(response?.results)) {
    return response.results
  }
  return Array.isArray(response?.tree) ? response.tree : []
}

function sourceTreeKey(raw) {
  return (
    raw?.meta?.data?.tree_key ??
    raw?.meta?.data?.treeKey ??
    raw?.meta?.data?.key ??
    raw?.key ??
    raw?.id
  )
}

function resourceId(raw) {
  return (
    raw?.meta?.data?.resource_id ?? raw?.meta?.data?.resourceId ?? raw?.meta?.data?.id ?? raw?.id
  )
}

function resourceType(raw) {
  return raw?.meta?.type || raw?.type || 'node'
}

function makeTreeId(type, id, parentKey) {
  const value = String(id)
  if (type === 'asset') {
    // Assets have a many-to-many relationship with nodes. Element Plus needs
    // a unique node key for every visual occurrence, while callers need the
    // original asset UUID for API queries.
    return `asset:${value}@${String(parentKey || 'root')}`
  }
  return value.startsWith('node:') ? value : `node:${value}`
}

/**
 * Convert provider payloads to XTree's neutral node shape.
 *
 * Both flat (`pId`) and nested (`children`) payloads are accepted. Tree IDs
 * are UI identities; the backend resource ID is retained in `meta.data.id`.
 */
export function normalizeNodeAssetResponse(response) {
  const rawNodes = unwrapResults(response)

  const normalize = (raw, inheritedParentSourceKey = '') => {
    const type = resourceType(raw)
    const rawSourceKey = sourceTreeKey(raw)
    const rawResourceId = resourceId(raw)
    const explicitParentSourceKey = raw.pId ?? raw.parent_key ?? raw.meta?.data?.parent_key
    const parentSourceKey = explicitParentSourceKey ?? inheritedParentSourceKey
    const treeId = makeTreeId(
      type,
      type === 'asset' ? rawResourceId : rawSourceKey,
      parentSourceKey
    )
    const parentTreeId = parentSourceKey ? makeTreeId('node', parentSourceKey) : undefined
    const children = (raw.children || []).map((child) => normalize(child, rawSourceKey))
    const hasChildren =
      type === 'asset'
        ? false
        : (raw.hasChildren ?? raw.isParent ?? raw.meta?.data?.has_children ?? children.length > 0)

    return {
      ...raw,
      id: treeId,
      pId: parentTreeId,
      parent_key: parentTreeId,
      children,
      hasChildren,
      isParent: hasChildren,
      _isLeaf: type === 'asset' || !hasChildren,
      meta: {
        ...raw.meta,
        type,
        data: {
          ...raw.meta?.data,
          id: rawResourceId,
          resource_id: rawResourceId,
          tree_id: treeId,
          tree_key: rawSourceKey
        }
      }
    }
  }

  const results = rawNodes.map((raw) => normalize(raw))
  if (Array.isArray(response)) {
    return results
  }
  return {
    ...response,
    results
  }
}

/** Return the stable backend identity without exposing XTree's UI key. */
export function toNodeAssetResource(node) {
  const type = node?.meta?.type || 'node'
  return {
    data: node,
    resourceId: node?.meta?.data?.resource_id ?? node?.meta?.data?.id,
    treeId: node?.id,
    treeKey: node?.meta?.data?.tree_key,
    type
  }
}

export function isNodeAssetMetricMode(value) {
  return NODE_ASSET_METRIC_MODES.includes(value)
}
