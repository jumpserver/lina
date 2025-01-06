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
    name: 'Test',
    title: vm.$t('验证密文'),
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
    title: vm.$t('SecretHistory'),
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
    title: '复制到其他资产',
    type: 'primary',
    divided: true,
    callback: ({ row }) => {
      vm.$route.query.flag = 'copy'
      vm.iAsset = vm.asset
      vm.account = row
      vm.showAddDialog = true
    }
  },
  {
    name: 'MoveToOther',
    title: '移动到其他资产',
    type: 'primary',
    callback: ({ row }) => {
      vm.$route.query.flag = 'move'
      vm.iAsset = vm.asset
      vm.account = row
      vm.showAddDialog = true
    }
  },
  {
    name: 'Clone',
    title: vm.$t('Duplicate'),
    divided: true
  }
]

export const accountQuickFilters = [
  {
    label: '最近(7天)',
    options: [
      {
        label: '最近发现',
        filter: {
          latest_discovery: '1'
        }
      },
      {
        label: '最近被登录',
        filter: {
          latest_accessed: '1'
        }
      },
      {
        label: '最近修改',
        filter: {
          latest_updated: '1'
        }
      },
      {
        label: '最近改密',
        filter: {
          latest_secret_changed: '1'
        }
      },
      {
        label: '最近改密失败',
        filter: {
          latest_secret_changed_failed: '1'
        }
      }
    ]
  },
  {
    label: '风险账号',
    options: [
      {
        label: '长期未登录账号',
        filter: {
          risk: 'long_time_no_login'
        }
      },
      {
        label: '未托管账号',
        filter: {
          risk: 'new_found'
        }
      },
      {
        label: '弱密码',
        filter: {
          risk: 'week_password'
        }
      },
      {
        label: '空密码',
        filter: {
          has_secret: 'false'
        }
      },
      {
        label: '长时间未改密',
        filter: {
          long_time_no_change_secret: 'true'
        }
      },
      {
        label: '长时间未验证',
        filter: {
          long_time_no_verify: 'true'
        }
      }
    ]
  },
  {
    label: '账号类型',
    options: [
      {
        label: '全部',
        filter: {
          category: ''
        }
      },
      {
        label: ' 主机',
        filter: {
          category: 'host'
        }
      },
      {
        label: '数据库',
        filter: {
          category: 'database'
        }
      },
      {
        label: '云',
        filter: {
          category: 'cloud'
        }
      },
      {
        label: '网络设备',
        filter: {
          category: 'device'
        }
      },
      {
        label: 'Web',
        filter: {
          category: 'website'
        }
      },
      {
        label: '其他',
        filter: {
          category: 'custom'
        }
      }
    ]
  }
]
