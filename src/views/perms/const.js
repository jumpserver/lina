import i18n from '@/i18n/i18n'

export const UserAssetPermissionListPageSearchConfigOptions = [
  { label: i18n.t('common.Name'), value: 'name' },
  { label: i18n.t('common.Username'), value: 'username' },
  { label: i18n.t('perms.UserGroups'), value: 'user_group' },
  { label: i18n.t('perms.AssetName'), value: 'asset_name' },
  { label: i18n.t('assets.AssetAddress'), value: 'address' },
  { label: i18n.t('perms.Account'), value: 'accounts' },
  {
    label: i18n.t('perms.isValid'), value: 'is_valid',
    children: [
      { value: '1', label: i18n.t('common.Yes') },
      { value: '0', label: i18n.t('common.No') }
    ]
  },
  {
    label: i18n.t('perms.isEffective'), value: 'is_effective',
    children: [
      { value: '1', label: i18n.t('common.Yes') },
      { value: '0', label: i18n.t('common.No') }
    ]
  },
  {
    label: i18n.t('perms.fromTicket'), value: 'from_ticket',
    children: [
      { value: '1', label: i18n.t('common.Yes') },
      { value: '0', label: i18n.t('common.No') }
    ]
  }
]

export const AssetPermissionListPageSearchConfigOptions = [
  ...UserAssetPermissionListPageSearchConfigOptions,
  {
    label: i18n.t('perms.NodeSearchStrategy'), value: 'all',
    children: [
      { value: '0', label: i18n.t('perms.OnlySearchCurrentNodePerm') },
      { value: '1', label: i18n.t('perms.SearchAncestorNodePerm') }
    ]
  }
]

export const AllAccount = '@ALL'
export const SPECAccount = '@SPEC'
export const SameUSER = '@USER'
export const ManualINPUT = '@INPUT'

export const AccountLabelMapper = {
  [AllAccount]: i18n.t('perms.AllAccounts'),
  [SPECAccount]: i18n.t('perms.SpecifyAccounts'),
  [SameUSER]: i18n.t('perms.SameAccount'),
  [ManualINPUT]: i18n.t('perms.ManualInput')
}
