const assetLabel = (asset) => {
  const name = asset?.name || asset?.address
  if (!name) return ''
  return asset.address && asset.address !== name ? `${name} (${asset.address})` : name
}

export const credentialAssetLabels = (credential) => {
  if (credential.mode !== 'subscription') return [assetLabel(credential.asset)].filter(Boolean)
  const assets = new Map()
  for (const account of credential.subscription_accounts || []) {
    const asset = account.asset
    const label = assetLabel(asset)
    if (label) assets.set(asset.id || label, label)
  }
  return [...assets.values()]
}

export const subscribedAccountLabel = (account) => {
  const name = account?.name || account?.username || '-'
  const username = account?.username
  const accountLabel = username && username !== name ? `${name} (${username})` : name
  const asset = assetLabel(account?.asset)
  return asset ? `${accountLabel} · ${asset}` : accountLabel
}
