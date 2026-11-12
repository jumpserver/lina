const assetLabel = (asset) => {
  const name = asset?.name || asset?.address
  if (!name) return ''
  return asset.name && asset.address ? `${asset.name}(${asset.address})` : name
}

export const credentialAssetLabels = (credential) => {
  const assets = new Map()
  const accounts =
    credential.mode === 'subscription'
      ? credential.subscription_accounts || []
      : [credential.account, credential.alternate_account]
  for (const account of accounts) {
    const asset = account?.asset
    const label = assetLabel(asset)
    if (label) assets.set(asset.id || label, label)
  }
  return assets.size || credential.mode === 'subscription'
    ? [...assets.values()]
    : [assetLabel(credential.asset)].filter(Boolean)
}

export const subscribedAccountLabel = (account) => {
  const name = account?.name || account?.username || '-'
  const username = account?.username
  const accountLabel =
    account?.name && username && name !== username ? `${name}(${username})` : name
  const asset = assetLabel(account?.asset)
  return asset ? `${accountLabel} - ${asset}` : accountLabel
}
