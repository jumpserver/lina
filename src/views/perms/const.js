import i18n from '@/i18n/i18n'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'
import DetailFormatter from '@/components/Table/TableFormatters/DetailFormatter.vue'

const t = i18n.global.t.bind(i18n.global)

export const UserAssetPermissionListPageSearchConfigOptions = [
  { label: t('Name'), value: 'name' },
  { label: t('Username'), value: 'username' },
  { label: t('UserGroups'), value: 'user_group' },
  { label: t('AssetName'), value: 'asset_name' },
  { label: t('AssetAddress'), value: 'address' },
  { label: t('Account'), value: 'accounts' },
  {
    label: t('Valid'),
    value: 'is_valid',
    children: [{ value: '1', label: t('Yes') }, { value: '0', label: t('No') }]
  },
  {
    label: t('Effective'),
    value: 'is_effective',
    children: [{ value: '1', label: t('Yes') }, { value: '0', label: t('No') }]
  },
  {
    label: t('FromTicket'),
    value: 'from_ticket',
    children: [{ value: '1', label: t('Yes') }, { value: '0', label: t('No') }]
  }
]

export const AssetPermissionTableMeta = {
  name: {
    formatter: DetailFormatter,
    minWidth: '120px',
    formatterArgs: {
      route: 'AssetPermissionDetail',
      drawer: true,
      routeQuery: {
        tab: 'Basic'
      }
    }
  },
  action: {
    label: t('Action'),
    formatter: row => {
      if (row.actions.length === 6) {
        return t('All')
      }
      return row.actions
        .map(item => {
          return item.label.replace(/ \([^)]*\)/, '')
        })
        .join(',')
    }
  },
  is_expired: {
    formatterArgs: {
      showFalse: false
    }
  },
  from_ticket: {
    width: '130px',
    formatterArgs: {
      showFalse: false
    }
  },
  users_amount: {
    width: 80,
    formatter: AmountFormatter,
    formatterArgs: {
      async: true,
      route: 'AssetPermissionDetail',
      drawer: true,
      routeQuery: {
        tab: 'AssetPermissionUser'
      }
    }
  },
  user_groups_amount: {
    width: 80,
    formatter: AmountFormatter,
    formatterArgs: {
      async: true,
      drawer: true,
      route: 'AssetPermissionDetail',
      routeQuery: {
        tab: 'AssetPermissionUser'
      }
    }
  },
  assets_amount: {
    width: 80,
    formatter: AmountFormatter,
    formatterArgs: {
      async: true,
      drawer: true,
      route: 'AssetPermissionDetail',
      routeQuery: {
        tab: 'AssetPermissionAsset'
      }
    }
  },
  nodes_amount: {
    width: 80,
    formatter: AmountFormatter,
    formatterArgs: {
      async: true,
      drawer: true,
      route: 'AssetPermissionDetail',
      routeQuery: {
        tab: 'AssetPermissionAsset'
      }
    }
  },
  accounts: {
    width: 80,
    formatter: AmountFormatter,
    formatterArgs: {
      cellValueToRemove: ['@SPEC'],
      drawer: true,
      getItem(item) {
        if (item !== '@SPEC') {
          return AccountLabelMapper[item] || item
        }
      },
      route: 'AssetPermissionDetail',
      routeQuery: {
        tab: 'AssetPermissionAccount'
      }
    }
  },
  actions: {
    formatterArgs: {
      updateRoute: 'AssetPermissionUpdate',
      cloneRoute: 'AssetPermissionCreate',
      performDelete: function({ row, col }) {
        const id = row.id
        const url = `/api/v1/perms/asset-permissions/${id}/`
        return this.$axios.delete(url)
      }
    }
  }
}

export const AssetPermissionListPageSearchConfigOptions = [
  ...UserAssetPermissionListPageSearchConfigOptions,
  {
    label: t('NodeSearchStrategy'),
    value: 'all',
    children: [
      { value: '0', label: t('OnlySearchCurrentNodePerm') },
      { value: '1', label: t('SearchAncestorNodePerm') }
    ]
  }
]

export const AllAccount = '@ALL'
export const SpecAccount = '@SPEC'
export const ExcludeAccount = '@NOT'
export const SameAccount = '@USER'
export const ManualAccount = '@INPUT'
export const AnonymousAccount = '@ANON'
export const NoneAccount = '@NONE'

export const AccountLabelMapper = {
  [AllAccount]: t('AllAccounts'),
  [SpecAccount]: t('SpecAccount'),
  [ExcludeAccount]: t('ExcludeAccount'),
  [NoneAccount]: t('None'),
  [SameAccount]: t('SameAccount'),
  [ManualAccount]: t('ManualAccount'),
  [AnonymousAccount]: t('AnonymousAccount')
}

export const virtualAccount = {
  label: t('VirtualAccounts'),
  value: '@VIRTUAL',
  tip: t('VirtualAccountHelpMsg')
}

export const realChoices = [
  {
    label: AccountLabelMapper[AllAccount],
    value: AllAccount,
    tip: t('AllAccountTip')
  },
  {
    label: AccountLabelMapper[SpecAccount],
    value: SpecAccount,
    tip: t('SpecAccountTip')
  },
  {
    label: AccountLabelMapper[ExcludeAccount],
    value: ExcludeAccount
  },
  {
    label: AccountLabelMapper[NoneAccount],
    value: NoneAccount
  }
]

export const virtualAccounts = [
  {
    label: AccountLabelMapper[ManualAccount],
    value: ManualAccount,
    tip: t('ManualAccountTip')
  },
  {
    label: AccountLabelMapper[SameAccount],
    value: SameAccount,
    tip: t('SameAccountTip')
  },
  {
    label: AccountLabelMapper[AnonymousAccount],
    value: AnonymousAccount,
    tip: t('AnonymousAccountTip')
  }
]

export const accountTemplateTable = {
  tableConfig: {
    url: '/api/v1/accounts/account-templates/',
    columns: ['name', 'username', 'has_secret', 'comment', 'date_created', 'date_updated'],
    columnsMeta: {
      name: {
        formatterArgs: {
          openInNewPage: true,
          getRoute({ row, col, cellValue }) {
            return {
              name: 'AccountTemplateDetail',
              params: {
                id: row.id
              }
            }
          }
        }
      },
      has_secret: {
        formatterArgs: {
          showFalse: false
        }
      },
      actions: {
        has: false
      }
    }
  },
  headerActions: {
    hasLeftActions: false,
    hasImport: false,
    hasExport: false
  }
}
