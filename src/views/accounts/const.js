import { toSafeLocalDateStr } from '@/utils/time'
import { ActionsFormatter, DiscoverConfirmFormatter } from '@/components/Table/TableFormatters'

export const gatherAccountTableConfig = (vm, url) => {
  if (!url) {
    url = '/api/v1/accounts/gathered-accounts/'
  }
  const h = vm.$createElement
  return {
    url: url,
    hasTree: true,
    columns: [
      'asset', 'username', 'date_last_login',
      'address_last_login', 'present',
      'remote_present', 'status',
      'date_updated'
    ],
    columnsShow: {
      default: [
        'username', 'asset', 'address_last_login',
        'date_last_login', 'present', 'remote_present', 'status'
      ]
    },
    columnsMeta: {
      asset: {
        formatter: function(row) {
          const to = {
            name: 'AssetDetail',
            params: { id: row.asset.id }
          }
          if (vm.$hasPerm('assets.view_asset')) {
            return h('router-link', { props: { to }}, row.asset.name)
          } else {
            return h('span', row.asset.name)
          }
        }
      },
      username: {
        formatter: function(row) {
          const to = {
            name: 'AccountDiscoverAccountDetail',
            params: { id: row.id }
          }
          return h('router-link', { props: { to }}, row.username)
        }
      },
      present: {
        width: '120px'
      },
      remote_present: {
        width: '120px'
      },
      date_updated: {
        formatter: function(row, col, cell) {
          return toSafeLocalDateStr(row.date_updated)
        }
      },
      address_last_login: {
        width: '150px'
      },
      status: {
        formatter: DiscoverConfirmFormatter,
        width: '100px',
        formatterArgs: {
          confirm: ({ row }) => {
            vm.$axios.put(
              `/api/v1/accounts/gathered-accounts/status/`,
              { status: 'confirmed', ids: [row.id] }
            ).then(res => {
              row.status = 'confirmed'
            }).catch(() => {
              row.status = vm.$t('Error')
            })
          },
          ignore: ({ row }) => {
            vm.$axios.put(
              `/api/v1/accounts/gathered-accounts/status/`,
              { status: 'ignored', ids: [row.id] }
            ).then(res => {
              row.status = 'ignored'
            }).catch(() => {
              row.status = vm.$t('Error')
            })
          },
          remove({ row }) {
            vm.deleteDialog.visible = true
            vm.deleteDialog.account = row
          }
        }
      },
      actions: {
        formatter: ActionsFormatter,
        formatterArgs: {
          hasClone: false,
          hasUpdate: false, // can set function(row, value)
          moreActionsTitle: vm.$t('More'),
          onDelete: ({ row }) => {
            vm.deleteDialog.visible = true
            vm.deleteDialog.account = row
          }
        }
      }
    }
  }
}

export const gatherAccountHeaderActions = (vm) => {
  return {
    hasCreate: false,
    hasImport: false,
    hasExport: true,
    searchConfig: {
      exclude: ['asset'],
      options: [
        {
          label: vm.$t('AssetName'),
          value: 'asset_name'
        }
      ]
    },
    extraMoreActions: [
      {
        name: 'SyncSelected',
        title: vm.$t('SyncSelected'),
        type: 'primary',
        icon: 'fa fa-check',
        can: ({ selectedRows }) => {
          return selectedRows.length > 0 && vm.$hasPerm('accounts.add_account')
        },
        callback: function({ selectedRows }) {
          const ids = selectedRows.map(v => {
            return v.id
          })
          vm.$axios.put(
            `/api/v1/accounts/gathered-accounts/status/`,
            { ids: ids, status: 'confirmed' }
          ).then(() => {
            vm.$message.success(vm.$tc('SyncSuccessMsg'))
          }).catch(err => {
            vm.$message.error(vm.$tc('SyncErrorMsg' + ' ' + err))
          })
        }
      },
      {
        name: 'SyncDeleteSelected',
        title: vm.$t('SyncDeleteSelected'),
        type: 'primary',
        icon: 'fa fa-exchange',
        can: ({ selectedRows }) => {
          return selectedRows.length > 0 && vm.$hasPerm('accounts.remove_account')
        },
        callback: function({ selectedRows }) {
          vm.gatherAccounts = selectedRows
          vm.showDeleteAccountDialog = false
          setTimeout(() => {
            vm.showDeleteAccountDialog = true
          })
        }
      }
    ]
  }
}

