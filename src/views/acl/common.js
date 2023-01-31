export const UserAssetAccountFieldInitial = {
  users: {
    username_group: '*'
  },
  assets: {
    name_group: '*',
    address_group: '*'
  },
  accounts: {
    username_group: '*'
  }
}

export function afterGetFormValueForHandleUserAssetAccount(formValue) {
  // users
  formValue.users.username_group = formValue.users.username_group.toString()
  // assets
  formValue.assets.name_group = formValue.assets.name_group.toString()
  formValue.assets.address_group = formValue.assets.address_group.toString()
  // accounts
  formValue.accounts.username_group = formValue.accounts.username_group.toString()
  return formValue
}

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
