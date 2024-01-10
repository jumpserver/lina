import i18n from '@/i18n/i18n'

export const UserAssetPermissionListPageSearchConfigOptions = [
  { label: i18n.t('Name'), value: 'name' },
  { label: i18n.t('Username'), value: 'username' },
  { label: i18n.t('UserGroups'), value: 'user_group' },
  { label: i18n.t('AssetName'), value: 'asset_name' },
  { label: i18n.t('AssetAddress'), value: 'address' },
  { label: i18n.t('Account'), value: 'accounts' },
  {
    label: i18n.t('isValid'), value: 'is_valid',
    children: [
      { value: '1', label: i18n.t('Yes') },
      { value: '0', label: i18n.t('No') }
    ]
  },
  {
    label: i18n.t('isEffective'), value: 'is_effective',
    children: [
      { value: '1', label: i18n.t('Yes') },
      { value: '0', label: i18n.t('No') }
    ]
  },
  {
    label: i18n.t('fromTicket'), value: 'from_ticket',
    children: [
      { value: '1', label: i18n.t('Yes') },
      { value: '0', label: i18n.t('No') }
    ]
  }
]

export const AssetPermissionListPageSearchConfigOptions = [
  ...UserAssetPermissionListPageSearchConfigOptions,
  {
    label: i18n.t('NodeSearchStrategy'), value: 'all',
    children: [
      { value: '0', label: i18n.t('OnlySearchCurrentNodePerm') },
      { value: '1', label: i18n.t('SearchAncestorNodePerm') }
    ]
  }
]

export const AllAccount = '@ALL'
export const SpecAccount = '@SPEC'
export const SameAccount = '@USER'
export const ManualAccount = '@INPUT'
export const AnonymousAccount = '@ANON'

export const AccountLabelMapper = {
  [AllAccount]: i18n.t('AllAccounts'),
  [SpecAccount]: i18n.t('SpecAccount'),
  [SameAccount]: i18n.t('SameAccount'),
  [ManualAccount]: i18n.t('ManualAccount'),
  [AnonymousAccount]: i18n.t('AnonymousAccount')
}
