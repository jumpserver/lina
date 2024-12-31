import {
  ActionsFormatter,
  ArrayFormatter,
  ChoicesFormatter,
  DetailFormatter,
  PlatformFormatter,
  ProtocolsFormatter
} from '@/components/Table/TableFormatters'
import HostInfoFormatter from '@/components/Table/TableFormatters/HostInfoFormatter.vue'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'
import { connectivityMeta } from '@/components/Apps/AccountListTable/const'
import { openTaskPage } from '@/utils/jms'

export function getDefaultConfig(vm) {
  const onAction = async(row, action) => {
    await vm.updateOrCloneAsset(row, action.toLowerCase())
  }
  const extraQuery = vm.$route.params?.extraQuery || {}
  const defaultHeaderActions = {
    onCreate: () => {
      vm.showPlatform = false
      setTimeout(() => {
        vm.showPlatform = true
      }, 100)
    },
    hasLabelSearch: true,
    searchConfig: {
      getUrlQuery: false
    },
    hasCreate: false,
    extraMoreActions: [
      {
        name: 'TestSelected',
        title: vm.$t('TestSelected'),
        type: 'primary',
        can: ({ selectedRows }) =>
          vm.$hasPerm('assets.test_assetconnectivity') &&
          !vm.$store.getters.currentOrgIsRoot &&
          selectedRows.length > 0 &&
          selectedRows[0].auto_config?.ansible_enabled &&
          selectedRows[0].auto_config?.ping_enabled,
        callback: function({ selectedRows }) {
          const ids = selectedRows.map(v => {
            return v.id
          })
          vm.$axios.post(
            '/api/v1/assets/assets/tasks/',
            { action: 'test', assets: ids }).then(res => {
            openTaskPage(res['task'])
          }).catch(err => {
            vm.$message.error(vm.$tc('common.bulkVerifyErrorMsg' + ' ' + err))
          })
        }
      },
      {
        name: 'DeactiveSelected',
        title: vm.$t('DisableSelected'),
        type: 'primary',
        icon: 'fa fa-ban',
        can: ({ selectedRows }) => {
          return selectedRows.length > 0 && vm.$hasPerm('assets.change_asset')
        },
        callback: function({ selectedRows }) {
          const ids = selectedRows.map((v) => {
            return { pk: v.id, is_active: false }
          })
          vm.$axios.patch(`/api/v1/assets/assets/`, ids).then(res => {
            vm.$message.success(vm.$tc('UpdateSuccessMsg'))
            vm.$refs.ListTable.reloadTable()
          }).catch(err => {
            vm.$message.error(vm.$tc('UpdateErrorMsg' + ' ' + err))
          })
        }
      },
      {
        name: 'ActiveSelected',
        title: vm.$t('ActivateSelected'),
        type: 'primary',
        icon: 'fa fa-check-circle-o',
        can: ({ selectedRows }) => {
          return selectedRows.length > 0 && vm.$hasPerm('assets.change_asset')
        },
        callback: function({ selectedRows }) {
          const ids = selectedRows.map((v) => {
            return { pk: v.id, is_active: true }
          })
          vm.$axios.patch(`/api/v1/assets/assets/`, ids).then(res => {
            vm.$message.success(vm.$tc('UpdateSuccessMsg'))
            vm.$refs.ListTable.reloadTable()
          }).catch(err => {
            vm.$message.error(vm.$tc('UpdateErrorMsg' + ' ' + err))
          })
        }
      },
      {
        name: 'actionUpdateSelected',
        title: vm.$t('UpdateSelected'),
        icon: 'batch-update',
        can: ({ selectedRows }) => {
          return selectedRows.length > 0 &&
            !vm.$store.getters.currentOrgIsRoot &&
            vm.$hasPerm('assets.change_asset')
        },
        callback: ({ selectedRows }) => {
          vm.updateSelectedDialogSetting.selectedRows = selectedRows
          vm.updateSelectedDialogSetting.visible = true
        }
      }
    ]
  }

  const tableConfig = {
    url: '/api/v1/assets/hosts/',
    permissions: {
      app: 'assets',
      resource: 'asset'
    },
    extraQuery: {
      ...extraQuery,
      ...vm.extraQuery
    },
    columnsExclude: ['spec_info', 'auto_config'],
    columnsShow: {
      min: ['name', 'address', 'actions'],
      default: vm.defaultColumns || [
        'name', 'address', 'accounts_amount', 'platform',
        'connectivity', 'actions'
      ]
    },
    columnsMeta: {
      type: { formatter: ChoicesFormatter, sortable: false },
      category: { formatter: ChoicesFormatter, sortable: false },
      name: {
        formatter: DetailFormatter,
        formatterArgs: {
          route: 'AssetDetail'
        },
        sortable: true
      },
      platform: {
        sortable: true,
        formatter: PlatformFormatter
      },
      protocols: {
        showFullContent: true,
        formatter: ProtocolsFormatter
      },
      nodes_display: {
        formatter: ArrayFormatter
      },
      address: {
        minWidth: '200px'
      },
      gathered_info: {
        label: vm.$t('HardwareInfo'),
        formatter: HostInfoFormatter,
        formatterArgs: {
          info: vm?.optionInfo,
          can: vm.$hasPerm('assets.refresh_assethardwareinfo'),
          getRoute({ row }) {
            return {
              name: 'AssetMoreInformationEdit',
              params: { id: row.id }
            }
          }
        }
      },
      accounts_amount: {
        label: vm.$t('Accounts'),
        formatter: AmountFormatter,
        width: '100px',
        formatterArgs: {
          async: true,
          getItem(item) {
            return `${item.name}(${item.username})`
          },
          getRoute({ row }) {
            return {
              name: 'AssetDetail',
              params: {
                id: row.id
              },
              query: {
                tab: 'Account'
              }
            }
          }
        }
      },
      connectivity: connectivityMeta,
      actions: {
        formatter: ActionsFormatter,
        formatterArgs: {
          onUpdate: ({ row }) => onAction(row, 'Update'),
          onClone: ({ row }) => onAction(row, 'Clone'),
          performDelete: ({ row }) => {
            const id = row.id
            const url = `/api/v1/assets/assets/${id}/`
            return vm.$axios.delete(url)
          },
          extraActions: [
            {
              name: 'Test',
              title: vm.$t('Test'),
              can: ({ row }) =>
                vm.$hasPerm('assets.test_assetconnectivity') &&
                !vm.$store.getters.currentOrgIsRoot &&
                row?.auto_config?.ansible_enabled &&
                row?.auto_config?.ping_enabled,
              callback: ({ row }) => {
                if (row.platform.name === 'Gateway') {
                  vm.gatewayVisible = true
                  const port = row.protocols.find(item => item.name === 'ssh').port
                  if (!port) {
                    return vm.$message.error(vm.$tc('BadRequestErrorMsg'))
                  } else {
                    vm.gatewayPort = port
                    vm.gatewayCell = row.id
                  }
                } else {
                  vm.$axios.post(
                    `/api/v1/assets/assets/${row.id}/tasks/`,
                    { action: 'test' }
                  ).then(res => {
                    openTaskPage(res['task'])
                  })
                }
              }
            },
            {
              name: 'AddAccount',
              title: '添加账号',
              divided: true
            },
            {
              name: 'DiscoverAccounts',
              title: 'Discover accounts',
              callback: ({ row }) => {
                console.log('Row: ', row)
                vm.discoveryDialog.asset = row.id
                console.log('vm.discoveryDialog.asset: ', vm.discoveryDialog)
                setTimeout(() => {
                  vm.discoveryDialog.visible = true
                }, 200)
              }
            },
            ...vm.addExtraMoreColActions
          ]
        }
      }
    }
  }
  return {
    tableConfig,
    defaultHeaderActions
  }
}

