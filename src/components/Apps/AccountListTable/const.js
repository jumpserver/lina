import { ChoicesFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export const connectivityMeta = {
  formatter: ChoicesFormatter,
  formatterArgs: {
    faChoices: {
      '-': '',
      ok: 'fa-check-circle',
      err: 'fa-times-circle',
      auth_err: 'fa-times-circle',
      sudo_err: 'fa-times-circle',
      password_err: 'fa-times-circle',
      openssh_key_err: 'fa-times-circle',
      ntlm_err: 'fa-times-circle',
      create_dir_err: 'fa-times-circle'
    },
    classChoices: {
      ok: 'text-primary',
      err: 'text-danger',
      auth_err: 'text-danger',
      sudo_err: 'text-danger',
      password_err: 'text-danger',
      openssh_key_err: 'text-danger',
      ntlm_err: 'text-danger',
      create_dir_err: 'text-danger'
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

export function isDirectoryServiceAccount(account, vm) {
  return vm.asset && vm.asset.id !== account.asset.id
}

export const accountOtherActions = (vm) => {
  return [
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
      can: ({ row }) => {
        return vm.$hasPerm('accounts.change_account') &&
          !vm.$store.getters.currentOrgIsRoot &&
          !isDirectoryServiceAccount(row, vm)
      },
      callback: ({ row }) => {
        vm.isUpdateAccount = true
        const data = {
          ...vm.asset,
          ...row.asset
        }
        vm.iAsset = data
        vm.account = row
        vm.addTemplate = false
        vm.showAddDialog = false
        setTimeout(() => {
          vm.showAddDialog = true
        })
      }
    },
    {
      name: 'UpdateSecret',
      title: vm.$t('EditSecret'),
      can: ({ row }) => {
        return vm.$hasPerm('accounts.change_account') &&
          !vm.$store.getters.currentOrgIsRoot &&
          !isDirectoryServiceAccount(row, vm)
      },
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
      has: () => {
        return !vm.asset
      },
      can: ({ row }) => {
        return vm.$hasPerm('accounts.add_account') &&
          !vm.$store.getters.currentOrgIsRoot &&
          !isDirectoryServiceAccount(row, vm)
      },
      callback: ({ row }) => {
        vm.account = {
          name: `${row.name} - ${vm.$t('Duplicate').toLowerCase()}`,
          username: `${row.username} - ${vm.$t('Duplicate').toLowerCase()}`,
          payload: 'pam_account_clone'
        }
        vm.iAsset = vm.asset

        vm.showAddDialog = false
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
      can: ({ row }) => {
        return vm.$hasPerm('accounts.change_account') &&
          !isDirectoryServiceAccount(row, vm)
      },
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
      title: vm.$t('HistoryPassword'),
      can: () => vm.$hasPerm('accounts.view_accountsecret'),
      type: 'primary',
      callback: ({ row }) => {
        vm.account = row
        vm.currentAccountColumn = row
        vm.showViewSecretDialog = false
        vm.secretUrl = `/api/v1/accounts/account-secrets/${row.id}/`
        setTimeout(() => {
          vm.showViewSecretDialog = true
        })
      }
    },
    {
      name: 'CopyToOther',
      title: vm.$t('CopyToAsset'),
      type: 'primary',
      divided: true,
      can: ({ row }) => {
        return vm.$hasPerm('accounts.add_account') &&
          !vm.$store.getters.currentOrgIsRoot &&
          !isDirectoryServiceAccount(row, vm)
      },
      has: () => {
        return !vm.asset
      },
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
      can: ({ row }) => {
        return vm.$hasPerm('accounts.add_account') &&
          !vm.$store.getters.currentOrgIsRoot &&
          !isDirectoryServiceAccount(row, vm)
      },
      has: () => {
        return !vm.asset
      },
      callback: ({ row }) => {
        vm.accountCreateUpdateTitle = vm.$t('MoveToOther')
        vm.$route.query.flag = 'move'
        vm.iAsset = vm.asset
        vm.account = row
        vm.showAddDialog = true
      }
    }
  ]
}

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
          latest_secret_change_failed: '1'
        }
      }
    ]
  },
  {
    label: vm.$t('RiskyAccount'),
    options: [
      {
        label: vm.$t('NoLoginLongTime'),
        filter: {
          long_time_no_login: 'true'
        }
      },
      {
        label: vm.$t('AddAccount'),
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
        label: vm.$t('LongTimePassword'),
        filter: {
          long_time_no_change_secret: 'true'
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
