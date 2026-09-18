import { shallowReactive } from 'vue'

export const MAX_CONTEXT_ASSETS = 10

const assetPages = new Set(['AssetList', 'AssetDetail', 'ConnectAssets'])
const sources = shallowReactive(new Map())

function text(value, limit = 128) {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value).trim().slice(0, limit)
    : ''
}

function identifier(value) {
  const result = text(value)
  return /^[a-zA-Z0-9_-]+$/.test(result) ? result : ''
}

function platformPath(value) {
  const path = text(value, 512)
  if (!path.startsWith('/') || path.startsWith('//')) return ''
  if (/[\\?#\u0000-\u001f]/.test(path)) return ''
  return path
}

function publicAddress(value) {
  const address = text(value, 256)
  if (!address.includes('://')) return address.split(/[?#]/, 1)[0].split('@').at(-1)
  try {
    const url = new URL(address)
    url.username = ''
    url.password = ''
    url.search = ''
    url.hash = ''
    return url.toString()
  } catch {
    return ''
  }
}

function assetSummary(value) {
  if (!value || typeof value !== 'object') return null
  const id = identifier(value.id)
  if (!id) return null
  return {
    id,
    name: text(value.name),
    address: publicAddress(value.address),
    platform: text(value.platform?.name || value.platform)
  }
}

function contextOrganization(route, organization) {
  const id = identifier(route?.query?.oid) || identifier(organization?.id)
  return { id, name: id === identifier(organization?.id) ? text(organization?.name) : '' }
}

export function pageContextScope(route, organization) {
  // fullPath is used only as a local invalidation key; it is never transmitted.
  return `${contextOrganization(route, organization).id}:${route?.fullPath || route?.path || ''}`
}

export function clearAssetPageContext(owner) {
  sources.delete(owner)
}

export function publishAssetPageContext(owner, route, organization, rows, detail = false) {
  if (!assetPages.has(route?.name)) return clearAssetPageContext(owner)
  const assets = []
  const seen = new Set()
  for (const row of Array.isArray(rows) ? rows : []) {
    const asset = assetSummary(row)
    if (!asset || seen.has(asset.id)) continue
    seen.add(asset.id)
    if (assets.length < MAX_CONTEXT_ASSETS) assets.push(asset)
    else break
  }
  if (!assets.length) return clearAssetPageContext(owner)
  sources.set(owner, {
    scope: pageContextScope(route, organization),
    assets,
    total: seen.size,
    detail
  })
}

export function sanitizePageContext(value) {
  if (!value) return null
  const name = text(value.page?.name)
  const path = platformPath(value.page?.path)
  if (!name || !path) return null
  const seen = new Set()
  const assets = []
  for (const row of (Array.isArray(value.selected_assets) ? value.selected_assets : []).slice(
    0,
    MAX_CONTEXT_ASSETS
  )) {
    const asset = assetSummary(row)
    if (!asset || seen.has(asset.id)) continue
    seen.add(asset.id)
    assets.push(asset)
  }
  return {
    version: 1,
    page: { name, path, title: text(value.page.title) },
    organization: {
      id: identifier(value.organization?.id),
      name: text(value.organization?.name)
    },
    selected_assets: assetPages.has(name) ? assets : [],
    selection_kind: value.selection_kind === 'detail' ? 'detail' : 'selection',
    selection_truncated: value.selection_truncated === true
  }
}

export function capturePageContext(route, organization) {
  const scope = pageContextScope(route, organization)
  const candidates = [...sources.values()].filter((source) => source.scope === scope)
  const selected = candidates.findLast((source) => source.detail) || candidates.at(-1)
  let assets = selected?.assets || []
  if (!selected && route.name === 'AssetDetail' && identifier(route.params?.id)) {
    assets = [{ id: route.params.id }]
  }
  return sanitizePageContext({
    page: { name: route.name, path: route.path, title: route.meta?.title },
    organization: contextOrganization(route, organization),
    selected_assets: assets,
    selection_kind: selected?.detail || route.name === 'AssetDetail' ? 'detail' : 'selection',
    selection_truncated: (selected?.total || 0) > MAX_CONTEXT_ASSETS
  })
}

export function getMessagePageContext(message) {
  const part = (Array.isArray(message?.parts) ? message.parts : []).find(
    (item) => item.type === 'data' && item.data?.kind === 'page_context'
  )
  return sanitizePageContext(part?.data?.context)
}
