export function getRelationIds(items) {
  return (items || []).map((item) => item.value || item.id || item)
}

export async function getNodeAssets(axios, nodeId) {
  const nodeAssets = []
  const limit = 100
  let offset = 0

  while (true) {
    const data = await axios.get(`/api/v1/assets/nodes/${nodeId}/assets/`, {
      params: { all: 1, limit, offset }
    })
    const assets = Array.isArray(data) ? data : data.results || []
    nodeAssets.push(...assets)

    if (assets.length < limit) {
      return nodeAssets
    }
    offset += assets.length
  }
}

export async function getAutomationAssets(axios, assets, nodes) {
  const nodeAssets = (
    await Promise.all(getRelationIds(nodes).map((nodeId) => getNodeAssets(axios, nodeId)))
  ).flat()
  const assetMap = new Map()
  ;[...(assets || []), ...nodeAssets].forEach((asset) => {
    const id = asset?.id || asset?.value || asset
    if (id && !assetMap.has(id)) {
      assetMap.set(id, typeof asset === 'object' ? asset : { id, name: id })
    }
  })
  return [...assetMap.values()]
}

export async function getAutomationAssetIds(axios, assets, nodes) {
  return (await getAutomationAssets(axios, assets, nodes)).map((asset) => asset.id)
}
