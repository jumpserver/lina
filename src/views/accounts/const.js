import { CronTab } from '@/components'
import i18n from '@/i18n/i18n'
import InputWithUnit from '@/components/Form/FormFields/InputWithUnit.vue'
import store from '@/store'
import { toSafeLocalDateStr } from '@/utils/time'
import { ActionsFormatter, DiscoverConfirmFormatter } from '@/components/Table/TableFormatters'

const validatorInterval = (rule, value, callback) => {
  if (parseInt(value) < 1) {
    return callback(new Error(i18n.t('EnsureThisValueIsGreaterThanOrEqualTo1')))
  }
  callback()
}

export const crontab = {
  type: 'cronTab',
  component: CronTab,
  label: i18n.t('Crontab'),
  hidden: (formValue) => {
    return formValue.is_periodic === false
  },
  helpText: i18n.t('CrontabHelpText'),
  helpTip: i18n.t('CrontabHelpTip')
}

export const interval = {
  label: i18n.t('Interval'),
  hidden: (formValue) => {
    return formValue.is_periodic === false
  },
  component: InputWithUnit,
  el: {
    unit: 'hour'
  },
  rules: [
    { validator: validatorInterval }
  ]
}

export const is_periodic = {
  type: 'checkbox',
  hidden: (formValue) => {
    return !store.getters.hasValidLicense
  }
}

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
        showOverflowTooltip: true
      },
      present: {
        label: '已同步',
        width: '120px'
      },
      remote_present: {
        label: '远端存在',
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
        label: vm.$t('Pending'),
        formatter: DiscoverConfirmFormatter,
        width: '100px',
        formatterArgs: {
          confirm: ({ row }) => {
            vm.$axios.put(
              `/api/v1/accounts/gathered-accounts/${row.id}/status/`,
              { status: 'confirmed' }
            ).then(res => {
              row.status = 'confirmed'
            }).catch(() => {
              row.status = vm.$t('Error')
            })
          },
          ignore: ({ row }) => {
            vm.$axios.put(
              `/api/v1/accounts/gathered-accounts/${row.id}/status/`,
              { status: 'ignored' }
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
          },
          extraActions: [
            {
              name: 'Sync',
              title: vm.$t('Sync'),
              can: vm.$hasPerm('accounts.add_account') && !vm.$store.getters.currentOrgIsRoot,
              type: 'primary',
              callback: ({ row }) => {
                vm.$axios.post(
                  `/api/v1/accounts/gathered-accounts/sync-accounts/`,
                  { gathered_account_ids: [row.id] }
                ).then(res => {
                  vm.$message.success(vm.$tc('SyncSuccessMsg'))
                }).catch(() => {
                })
              }
            }
          ]
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
        title: vm.$t('ConfirmSelected'),
        type: 'primary',
        icon: 'fa fa-check',
        can: ({ selectedRows }) => {
          return selectedRows.length > 0 && vm.$hasPerm('accounts.add_account')
        },
        callback: function({ selectedRows }) {
          const ids = selectedRows.map(v => {
            return v.id
          })
          vm.$axios.post(
            `/api/v1/accounts/gathered-accounts/sync-accounts/`,
            { gathered_account_ids: ids }
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

export default {
  crontab: crontab,
  interval: interval,
  is_periodic: is_periodic
}

