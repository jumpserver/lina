export const subscribedAccountLabel = (account) => {
  const name = account?.name || account?.username || '-'
  const username = account?.username
  const accountLabel = username && username !== name ? `${name} (${username})` : name
  const asset = account?.asset
  const assetName = asset?.name || asset?.address
  if (!assetName) return accountLabel
  const assetLabel =
    asset.address && asset.address !== assetName ? `${assetName} (${asset.address})` : assetName
  return `${accountLabel} · ${assetLabel}`
}
