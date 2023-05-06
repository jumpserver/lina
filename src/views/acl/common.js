
export function cleanFormValueForHandleUserAssetAccount(value) {
  // users
  if (!Array.isArray(value.users.username_group)) {
    value.users.username_group = value.users.username_group ? value.users.username_group.split(',') : []
  }
  // assets
  if (!Array.isArray(value.assets.name_group)) {
    value.assets.name_group = value.assets.name_group ? value.assets.name_group.split(',') : []
  }
  if (!Array.isArray(value.assets.address_group)) {
    value.assets.address_group = value.assets.address_group ? value.assets.address_group.split(',') : []
  }
  // accounts
  if (!Array.isArray(value.accounts.username_group)) {
    value.accounts.username_group = value.accounts.username_group ? value.accounts.username_group.split(',') : []
  }
  return value
}
