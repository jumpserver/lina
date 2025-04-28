import i18n from '@/i18n/i18n'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'
import DetailFormatter from '@/components/Table/TableFormatters/DetailFormatter.vue'

export const UserAssetPermissionListPageSearchConfigOptions = [
  { label: i18n.t('Name'), value: 'name' },
  { label: i18n.t('Username'), value: 'username' },
  { label: i18n.t('UserGroups'), value: 'user_group' },
  { label: i18n.t('AssetName'), value: 'asset_name' },
  { label: i18n.t('AssetAddress'), value: 'address' },
  { label: i18n.t('Account'), value: 'accounts' },
  {
    label: i18n.t('Valid'), value: 'is_valid',
    children: [
      { value: '1', label: i18n.t('Yes') },
      { value: '0', label: i18n.t('No') }
    ]
  },
  {
    label: i18n.t('Effective'), value: 'is_effective',
    children: [
      { value: '1', label: i18n.t('Yes') },
      { value: '0', label: i18n.t('No') }
    ]
  },
  {
    label: i18n.t('FromTicket'), value: 'from_ticket',
    children: [
      { value: '1', label: i18n.t('Yes') },
      { value: '0', label: i18n.t('No') }
    ]
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
    label: i18n.t('Action'),
    formatter: (row) => {
      if (row.actions.length === 6) {
        return i18n.t('All')
      }
      return row.actions.map(item => {
        return item.label.replace(/ \([^)]*\)/, '')
      }).join(',')
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
