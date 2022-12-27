import i18n from '@/i18n/i18n'

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

export const fieldsMetaListPageForUserAssetAccount = {
  user_username_group: {
    prop: 'users.username_group',
    formatter: function(row) {
      return row.users.username_group.toString()
    },
    label: i18n.t('acl.UserUsername')
  },
  asset_name_group: {
    prop: 'assets.name_group',
    formatter: function(row) {
      return row.assets.name_group.toString()
    },
    label: i18n.t('acl.AssetName')
  },
  asset_address_group: {
    prop: 'assets.address_group',
    formatter: function(row) {
      return row.assets.address_group.toString()
    },
    label: i18n.t('acl.AssetAddress')
  },
  account_username_group: {
    prop: 'accounts.username_group',
    formatter: function(row) {
      return row.accounts.username_group.toString()
    },
    label: i18n.t('acl.AccountUsername')
  }
}

export const userAssetAccountFieldNames = Object.keys(fieldsMetaListPageForUserAssetAccount)
