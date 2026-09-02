export const USER_TREE_RESOURCE_TYPES = Object.freeze(['organization', 'user_group', 'user'])

export const USER_TREE_ORDER_VALUES = Object.freeze(['name', 'username'])

const RESOURCE_TYPE_ALIASES = Object.freeze({
  group: 'user_group',
  org: 'organization',
  usergroup: 'user_group'
})

function responseResults(response) {
  if (Array.isArray(response)) {
    return response
  }
  if (Array.isArray(response?.results)) {
    return response.results
  }
  return Array.isArray(response?.tree) ? response.tree : []
}

function responseWithResults(response, results) {
  return Array.isArray(response) ? results : { ...response, results }
}

function normalizeResourceType(raw) {
  const value = String(raw?.meta?.type || raw?.type || '').toLowerCase()
  return RESOURCE_TYPE_ALIASES[value] || value || 'user'
}

function hasTypedTreeId(value) {
  return /^(organization|user_group|user):/.test(String(value || ''))
}

function hasCompleteUserTreeId(value) {
  const id = String(value || '')
  return id.startsWith('user:') && id.slice('user:'.length).includes(':')
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key)
}

function normalizeResourceId(type, value) {
  if (value === undefined || value === null) {
    return value
  }
  const id = String(value)
  const prefix = `${type}:`
  if (!id.startsWith(prefix)) {
    return value
  }
  return type === 'user' ? id.split(':').at(-1) : id.slice(prefix.length)
}

function makeTreeId(type, resourceId, parentTreeId, rawTreeId) {
  if (hasTypedTreeId(rawTreeId) && (type !== 'user' || hasCompleteUserTreeId(rawTreeId))) {
    return String(rawTreeId)
  }
  const identity = String(resourceId ?? rawTreeId ?? '')
  if (type === 'user') {
    return `user:${String(parentTreeId || 'root')}:${identity}`
  }
  return `${type}:${identity}`
}

function makeParentTreeId(raw, type, inheritedParentTreeId) {
  const explicitParent =
    raw?.pId ?? raw?.parent_key ?? raw?.parent_id ?? raw?.meta?.data?.parent_tree_id
  if (explicitParent === undefined || explicitParent === null || explicitParent === '') {
    return inheritedParentTreeId || undefined
  }
  if (hasTypedTreeId(explicitParent)) {
    return String(explicitParent)
  }
  const parentType = String(raw?.parent_type || raw?.meta?.data?.parent_type || '').toLowerCase()
  if (parentType) {
    return makeTreeId(RESOURCE_TYPE_ALIASES[parentType] || parentType, explicitParent)
  }
  return makeTreeId(type === 'user' ? 'user_group' : 'organization', explicitParent)
}

/**
 * Normalize nested or flat user-tree responses to XTree's neutral node shape.
 *
 * A user can occur below multiple groups, so the visual ID contains its branch
 * while `meta.data.resource_id` always retains the stable backend UUID.
 */
export function normalizeUserTreeResponse(response) {
  const normalize = (raw, inheritedParentTreeId) => {
    const type = normalizeResourceType(raw)
    const metaData = raw?.meta?.data || {}
    const rawResourceId = hasOwn(metaData, 'resource_id')
      ? metaData.resource_id
      : hasOwn(raw, 'resource_id')
        ? raw.resource_id
        : (metaData.id ?? raw?.id)
    const resourceId = normalizeResourceId(type, rawResourceId)
    const parentTreeId = makeParentTreeId(raw, type, inheritedParentTreeId)
    const rawTreeId = metaData.tree_id ?? raw?.tree_id ?? raw?.id
    const treeId = makeTreeId(type, resourceId, parentTreeId, rawTreeId)
    const children = (raw?.children || []).map((child) => normalize(child, treeId))
    const hasChildren =
      type !== 'user' &&
      Boolean(
        raw?.hasChildren ??
        raw?.isParent ??
        raw?.meta?.data?.has_children ??
        (Number(raw?.users_amount) > 0 || children.length > 0)
      )

    return {
      ...raw,
      id: treeId,
      pId: parentTreeId,
      parent_key: parentTreeId,
      children,
      hasChildren,
      isParent: hasChildren,
      _isLeaf: type === 'user' || !hasChildren,
      meta: {
        ...raw?.meta,
        type,
        data: {
          ...metaData,
          id: metaData.id ?? resourceId,
          resource_id: resourceId,
          tree_id: treeId
        }
      }
    }
  }

  const results = responseResults(response).map((raw) => normalize(raw))
  return responseWithResults(response, results)
}

export function toUserTreeResource(node) {
  const metaData = node?.meta?.data || {}
  const type = normalizeResourceType(node)
  const rawResourceId = hasOwn(metaData, 'resource_id')
    ? metaData.resource_id
    : hasOwn(node, 'resource_id')
      ? node.resource_id
      : (metaData.id ?? node?.id)
  return {
    data: node,
    resourceId: normalizeResourceId(type, rawResourceId),
    treeId: metaData.tree_id ?? node?.id,
    type
  }
}

export function isUserTreeResourceType(value) {
  return USER_TREE_RESOURCE_TYPES.includes(value)
}

export function isUserTreeOrder(value) {
  return USER_TREE_ORDER_VALUES.includes(value)
}
