// Finish paging direct child nodes before requesting direct assets. Otherwise
// later node pages are inserted above visible assets and shift the tree rows.
export function getNodeAssetPageParams({
  parentKey,
  nodeLimit = 100,
  assetsLimit = 100,
  assetOrder = 'name',
  includeAssetCount = false,
  includeAssets = true,
  next = null
} = {}) {
  const includeNodes = next?.phase !== 'assets'
  const loadAssets = includeAssets && !includeNodes
  return {
    ...(parentKey ? { parent_key: parentKey } : {}),
    ...(includeAssetCount === null ? {} : { include_asset_count: includeAssetCount }),
    ...(includeNodes
      ? { node_page_size: nodeLimit, ...(next?.nodeCursor ? { node_cursor: next.nodeCursor } : {}) }
      : { include_nodes: false }),
    ...(loadAssets
      ? {
          include_assets: true,
          asset_page_size: assetsLimit,
          ...(next?.assetOffset ? { asset_offset: next.assetOffset } : {}),
          ...(assetOrder !== 'name' ? { asset_order_by: assetOrder } : {})
        }
      : {})
  }
}

export function combineNodeAssetPagination(response, { includeAssets = true } = {}) {
  if (Array.isArray(response) || (!response?.node_pagination && !response?.asset_pagination)) {
    return response
  }
  const nodes = response.node_pagination
  const assets = response.asset_pagination
  let next = null
  if (nodes?.has_more) {
    const nodeCursor = nodes.next
      ? new URL(nodes.next, 'http://localhost').searchParams.get('node_cursor')
      : null
    if (nodeCursor) {
      next = { phase: 'nodes', nodeCursor }
    }
  } else if (includeAssets) {
    // No asset pagination means assets have not been requested yet. An empty
    // final asset page must terminate instead of starting that phase again.
    const assetOffset = assets ? (assets.has_more ? assets.next_offset : null) : 0
    if (assetOffset != null) {
      next = { phase: 'assets', assetOffset }
    }
  }
  return {
    ...response,
    node_pagination: {
      ...nodes,
      parent_key: nodes?.parent_key || assets?.parent_key || '',
      has_more: Boolean(next),
      next
    }
  }
}
