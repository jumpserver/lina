import { createXTreeDataSource } from '@/components/Tree/XTree/config'
import { getNodeAssetPageParams } from '@/components/Tree/NodeAssetTree/pagination'

export const AUTHORIZATION_TREE_NAME = 'AuthorizationTree'
export const FAVORITE_TREE_NAME = 'FavoriteTree'
export const TYPE_TREE_NAME = 'TypeTree'
export const FAVORITE_ROOT_ID = 'favorite-root'

export function addUserAssetUrlParams(url, params) {
  const parsed = new URL(url, 'http://localhost')
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') {
      parsed.searchParams.delete(key)
    } else {
      parsed.searchParams.set(key, value)
    }
  }
  return `${parsed.pathname}${parsed.search}`
}

export function getAuthorizationAssetsUrl(baseUrl, node) {
  const resourceId = node?.meta?.data?.id
  if (node?.meta?.type === 'asset') {
    return addUserAssetUrlParams(baseUrl, { id: resourceId })
  }
  const parsed = new URL(baseUrl, 'http://localhost')
  if (resourceId === 'ungrouped') {
    parsed.pathname = parsed.pathname.replace('/assets/', '/nodes/ungrouped/assets/')
    return `${parsed.pathname}${parsed.search}`
  }
  if (resourceId) {
    parsed.pathname = parsed.pathname.replace('/assets/', `/nodes/${resourceId}/assets/`)
    return `${parsed.pathname}${parsed.search}`
  }
  return baseUrl
}

export function getFavoriteAssetsUrl(baseUrl, node) {
  const resourceId = node?.meta?.data?.id
  if (node?.meta?.type === 'asset') {
    return addUserAssetUrlParams(baseUrl, { id: resourceId })
  }
  if (resourceId && resourceId !== FAVORITE_ROOT_ID) {
    return addUserAssetUrlParams(baseUrl, { folder_id: resourceId })
  }
  return baseUrl
}

export function getTypeAssetsUrl(baseUrl, node) {
  const nodeType = node?.meta?.type
  const params = {
    category: null,
    id: null,
    node_id: null,
    platform: null,
    type: null
  }
  if (nodeType === 'category') {
    params.category = node.meta.category
  } else if (nodeType === 'type') {
    params.category = node.meta.category
    params.type = node.meta._type
  } else if (nodeType === 'platform') {
    params.platform = node.id
  }
  return addUserAssetUrlParams(baseUrl, params)
}

function userPermissionUrl(user, path) {
  return `/api/v1/perms/users/${user}/${path}`
}

function nodeResourceId(node) {
  return node?.resourceId ?? node?.meta?.data?.resource_id ?? node?.meta?.data?.id
}

function typedResources(nodes) {
  const seen = new Set()
  const resources = []
  for (const node of nodes || []) {
    const type = node?.type === 'asset' || node?.meta?.type === 'asset' ? 'asset' : 'node'
    const id = nodeResourceId(node)
    const identity = `${type}:${id}`
    if (id === undefined || id === null || seen.has(identity)) {
      continue
    }
    seen.add(identity)
    resources.push({ type, id: String(id) })
  }
  return resources
}

function metricsDefinition(user, tree) {
  return {
    method: 'post',
    url: userPermissionUrl(user, 'tree-metrics/'),
    data: ({ nodes }) => ({
      tree,
      resources: typedResources(nodes)
    })
  }
}

function addTypeTreeRootAmount(response) {
  const nodes = Array.isArray(response) ? response : response?.results
  if (!Array.isArray(nodes)) {
    return response
  }

  const total = nodes
    .filter((node) => node?.meta?.type === 'category')
    .reduce((sum, node) => {
      const amount = String(node.name || '').match(/\((\d+)\)\s*$/)?.[1]
      return sum + (amount ? Number(amount) : 0)
    }, 0)
  const results = nodes.map((node) =>
    String(node.id) === 'ROOT' ? { ...node, assets_amount: total } : node
  )
  return Array.isArray(response) ? results : { ...response, results }
}

export function createUserAuthorizationTreeDataSource(request, user) {
  const treeUrl = userPermissionUrl(user, 'nodes/children-with-assets/tree/')
  return createXTreeDataSource(request, {
    root: {
      url: treeUrl,
      params: (payload) => getNodeAssetPageParams({ ...payload, includeAssetCount: null })
    },
    children: {
      url: treeUrl,
      params: ({ parent, ...payload }) =>
        getNodeAssetPageParams({
          ...payload,
          includeAssetCount: null,
          parentKey: parent.treeKey
        })
    },
    metrics: metricsDefinition(user, 'authorization')
  })
}

export function createUserTypeTreeDataSource(request, user) {
  return createXTreeDataSource(request, {
    root: {
      url: userPermissionUrl(user, 'nodes/children-with-assets/category/tree/'),
      transform: addTypeTreeRootAmount
    }
  })
}

function favoriteFolderMutationResult(folder) {
  return {
    ...folder,
    key: `favorite-folder:${folder.id}`,
    resourceId: String(folder.id),
    resource_id: String(folder.id),
    value: folder.name
  }
}

export function createUserFavoriteTreeDataSource(
  request,
  user,
  { editable = false, onMutated, newFolderName = 'New folder' } = {}
) {
  const treeUrl = userPermissionUrl(user, 'favorite-tree/')
  const definitions = {
    root: {
      url: treeUrl,
      params: { include_assets: false }
    },
    children: {
      url: treeUrl,
      params: ({ parent }) => ({
        include_assets: false,
        parent_id: nodeResourceId(parent)
      })
    },
    metrics: metricsDefinition(user, 'favorite')
  }

  if (editable) {
    definitions.create = {
      method: 'post',
      url: '/api/v1/assets/favorite-folders/',
      data: ({ parent }) => {
        const parentId = nodeResourceId(parent)
        return {
          name: newFolderName,
          parent: parentId === FAVORITE_ROOT_ID ? null : parentId
        }
      },
      transform: (response) => {
        onMutated?.('create', response)
        return favoriteFolderMutationResult(response)
      }
    }
    definitions.update = {
      method: 'patch',
      url: ({ node }) => `/api/v1/assets/favorite-folders/${node.meta.data.id}/`,
      data: ({ value }) => ({ name: value }),
      transform: (response) => {
        onMutated?.('update', response)
        return favoriteFolderMutationResult(response)
      }
    }
    definitions.remove = {
      method: 'delete',
      url: ({ node }) => `/api/v1/assets/favorite-folders/${node.meta.data.id}/`,
      transform: (response, { node }) => {
        onMutated?.('remove', node?.meta?.data)
        return response
      }
    }
  }

  return createXTreeDataSource(request, definitions)
}
