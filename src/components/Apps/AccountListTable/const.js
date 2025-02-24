import { ChoicesFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export const connectivityMeta = {
  formatter: ChoicesFormatter,
  formatterArgs: {
    faChoices: {
      '-': '',
      ok: 'fa-check-circle',
      err: 'fa-times-circle'
    },
    classChoices: {
      ok: 'text-primary',
      err: 'text-danger'
    },
    getText({ cellValue }) {
      if (cellValue?.value === '-' || cellValue?.value === 'unknown') {
        return '-'
      } else {
        return cellValue?.label
      }
    }
  },
  width: '130px'
}

export const accountOtherActions = (vm) => [
  {
    name: 'View',
    title: vm.$t('View'),
    can: vm.$hasPerm('accounts.view_accountsecret'),
    type: 'primary',
    order: 1,
    callback: ({ row }) => {
      // debugger
      vm.secretUrl = `/api/v1/accounts/account-secrets/${row.id}/`
      vm.account = row
      vm.showViewSecretDialog = false
      setTimeout(() => {
        vm.showViewSecretDialog = true
      })
    }
  },
  {
    name: 'Update',
    title: vm.$t('Edit'),
    can: vm.$hasPerm('accounts.change_account') && !vm.$store.getters.currentOrgIsRoot,
    callback: ({ row }) => {
      const data = {
        ...vm.asset,
        ...row.asset
      }
      vm.account = row
      vm.iAsset = data
      vm.showAddDialog = false
      vm.accountCreateUpdateTitle = vm.$t('UpdateAccount')
      setTimeout(() => {
        vm.showAddDialog = true
      })
    }
  },
  {
    name: 'UpdateSecret',
    title: vm.$t('EditSecret'),
    can: vm.$hasPerm('accounts.change_account') && !vm.$store.getters.currentOrgIsRoot,
    callback: ({ row }) => {
      const data = {
        ...vm.asset,
        ...row.asset
      }
      vm.account = row
      vm.iAsset = data
      vm.showUpdateSecretDialog = false
      vm.accountCreateUpdateTitle = vm.$t('UpdateAccount')
      setTimeout(() => {
        vm.showUpdateSecretDialog = true
      })
    }
  },
  {
    name: 'Clone',
    title: vm.$t('Duplicate'),
    can: vm.$hasPerm('accounts.add_account') && !vm.$store.getters.currentOrgIsRoot,
    callback: ({ row }) => {
      const data = {
        ...vm.asset,
        ...row.asset
      }
      vm.account = {
        ...row,
        name: `${row.name} - ${vm.$t('Duplicate').toLowerCase()}`
      }
      vm.iAsset = data
      vm.showAddDialog = false
      vm.accountCreateUpdateTitle = vm.$t('DuplicateAccount')
      setTimeout(() => {
        vm.showAddDialog = true
      })
    }
  },
  {
    name: 'Test',
    title: vm.$t('VerifySecret'),
    divided: true,
    can: ({ row }) =>
      !vm.$store.getters.currentOrgIsRoot &&
      vm.$hasPerm('accounts.verify_account') &&
      row.asset['auto_config'].ansible_enabled &&
      row.asset['auto_config'].ping_enabled,
    callback: ({ row }) => {
      vm.$axios.post(
        `/api/v1/accounts/accounts/tasks/`,
        { action: 'verify', accounts: [row.id] }
      ).then(res => {
        openTaskPage(res['task'])
      })
    }
  },
  {
    name: 'ClearSecret',
    title: vm.$t('ClearSecret'),
    can: vm.$hasPerm('accounts.change_account'),
    type: 'primary',
    callback: ({ row }) => {
      vm.$axios.patch(
        `/api/v1/accounts/accounts/clear-secret/`,
        { account_ids: [row.id] }
      ).then(() => {
        vm.$message.success(vm.$tc('ClearSuccessMsg'))
      })
    }
  },
  {
    name: 'SecretHistory',
    // 密文历史
    title: vm.$t('HistoryPassword'),
    can: () => vm.$hasPerm('accounts.view_accountsecret'),
    type: 'primary',
    callback: ({ row }) => {
      vm.currentAccountColumn = row
      vm.$nextTick(() => {
        vm.showPasswordHistoryDialog = true
      })
    }
  },
  {
    name: 'CopyToOther',
    title: vm.$t('CopyToAsset'),
    type: 'primary',
    divided: true,
    callback: ({ row }) => {
      vm.accountCreateUpdateTitle = vm.$t('CopyToOther')
      vm.$route.query.flag = 'copy'
      vm.iAsset = vm.asset
      vm.account = row
      vm.showAddDialog = true
    }
  },
  {
    name: 'MoveToOther',
    title: vm.$t('MoveToAsset'),
    type: 'primary',
    callback: ({ row }) => {
      vm.accountCreateUpdateTitle = vm.$t('MoveToOther')
      vm.$route.query.flag = 'move'
      vm.iAsset = vm.asset
      vm.account = row
      vm.showAddDialog = true
    }
  }
]

export const accountQuickFilters = (vm) => [
  {
    label: vm.$t('Recent (7 days)'),
    options: [
      {
        label: vm.$t('RecentlyDiscovered'),
        filter: {
          latest_discovery: '1'
        }
      },
      {
        label: vm.$t('RecentlyLoggedIn'),
        filter: {
          latest_accessed: '1'
        }
      },
      {
        label: vm.$t('RecentlyModified'),
        filter: {
          latest_updated: '1'
        }
      },
      {
        label: vm.$t('RecentlyChangedPassword'),
        filter: {
          latest_secret_changed: '1'
        }
      },
      {
        label: vm.$t('RecentPasswordChangeFailed'),
        filter: {
          latest_secret_changed_failed: '1'
        }
      }
    ]
  },
  {
    label: vm.$t('RiskyAccount'),
    options: [
      {
        label: vm.$t('LongTimeNoLogin'),
        filter: {
          risk: 'long_time_no_login'
        }
      },
      {
        label: vm.$t('UnmanagedAccount'),
        filter: {
          risk: 'new_found'
        }
      },
      {
        label: vm.$t('WeakPassword'),
        filter: {
          risk: 'weak_password'
        }
      },
      {
        label: vm.$t('EmptyPassword'),
        filter: {
          has_secret: 'false'
        }
      },
      {
        label: vm.$t('LongTimeNoChangeSecret'),
        filter: {
          long_time_no_change_secret: 'true'
        }
      },
      {
        label: vm.$t('LongTimeNoVerify'),
        filter: {
          long_time_no_verify: 'true'
        }
      }
    ]
  },
  {
    label: vm.$t('AccountType'),
    options: [
      {
        label: vm.$t('All'),
        filter: {
          category: ''
        }
      },
      {
        label: vm.$t('Host'),
        filter: {
          category: 'host'
        }
      },
      {
        label: vm.$t('Database'),
        filter: {
          category: 'database'
        }
      },
      {
        label: vm.$t('Cloud'),
        filter: {
          category: 'cloud'
        }
      },
      {
        label: vm.$t('Device'),
        filter: {
          category: 'device'
        }
      },
      {
        label: 'Web',
        filter: {
          category: 'web'
        }
      },
      {
        label: vm.$t('Other'),
        filter: {
          category: 'custom'
        }
      }
    ]
  }
]
