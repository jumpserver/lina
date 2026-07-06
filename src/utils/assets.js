const assetModules = import.meta.glob('../assets/**/*', {
  eager: true,
  import: 'default'
})

function normalizeAssetPath(path) {
  return path
    .replace(/^@\/assets\//, '')
    .replace(/^\/?src\/assets\//, '')
    .replace(/^assets\//, '')
}

export function getAssetUrl(path) {
  const normalizedPath = normalizeAssetPath(path)
  return assetModules[`../assets/${normalizedPath}`] || ''
}

export function getAssetUrlOr(path, fallbackPath) {
  return getAssetUrl(path) || getAssetUrl(fallbackPath)
}
