<template>
  <div>
    <el-alert v-if="helpMessage" show-icon type="info">
      <span v-sanitize="helpMessage" class="announcement-main" />
    </el-alert>
    <ListTable ref="ListTable" :header-actions="iHeaderActions" :table-config="iTableConfig" />
    <PlatformDialog :category="category" :visible.sync="showPlatform" />
    <AssetBulkUpdateDialog
      v-if="updateSelectedDialogSetting.visible"
      :category="category"
      :visible.sync="updateSelectedDialogSetting.visible"
      v-bind="updateSelectedDialogSetting"
      @update="handleAssetBulkUpdate"
    />
    <GatewayDialog
      :cell="gatewayCell"
      :port="gatewayPort"
      :visible.sync="gatewayVisible"
    />
    <AccountDiscoverDialog :asset="discoveryDialog.asset" :visible.sync="discoveryDialog.visible" />
  </div>
</template>

<script>
import { ListTable } from '@/components'
import {
  ActionsFormatter,
  ArrayFormatter,
  ChoicesFormatter,
  DetailFormatter,
  PlatformFormatter,
  ProtocolsFormatter
} from '@/components/Table/TableFormatters'
import AssetBulkUpdateDialog from './AssetBulkUpdateDialog'
import { connectivityMeta } from '@/components/Apps/AccountListTable/const'
import PlatformDialog from '../components/PlatformDialog'
import GatewayDialog from '@/components/Apps/GatewayDialog'
import { openTaskPage } from '@/utils/jms'
import HostInfoFormatter from '@/components/Table/TableFormatters/HostInfoFormatter'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'
import AccountDiscoverDialog from './AccountDiscoverDialog.vue'

export default {
  components: {
    ListTable,
    GatewayDialog,
    PlatformDialog,
    AccountDiscoverDialog,
    AssetBulkUpdateDialog
  },
  props: {
    url: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: ''
    },
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    headerActions: {
      type: Object,
      default: () => ({})
    },
    addExtraMoreActions: {
      type: Array,
      default: () => []
    },
    addExtraMoreColActions: {
      type: Array,
      default: () => []
    },
    helpMessage: {
      type: String,
      default: ''
    },
    optionInfo: {
      type: Object,
      default: () => ({})
    },
    // url中需要添加额外的参数
    extraQuery: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    const onAction = (row, action) => {
      let routeAction = action
      if (action === 'Clone') {
        routeAction = 'Create'
      }
      const routeName = _.capitalize(row.category.value) + routeAction
      const route = {
        name: routeName,
        params: {},
        query: {}
      }
      if (action === 'Clone') {
        route.query.clone_from = row.id
      } else if (action === 'Update') {
        route.params.id = row.id
      }
      if (['Create', 'Update'].includes(routeAction)) {
        route.query.platform = row.platform.id
        route.query.type = row.type.value
        route.query.category = row.type.category
      }
      const createInNewPage = this.$route.query.node_id
      if (createInNewPage) {
        const { href } = vm.$router.resolve(route)
        window.open(href, '_blank')
      } else {
        this.$router.push(route)
      }
    }
    const extraQuery = this.$route.params?.extraQuery || {}
    return {
      showPlatform: false,
      gatewayPort: 0,
      gatewayCell: '',
      gatewayVisible: false,
      defaultConfig: {
        url: '/api/v1/assets/hosts/',
        permissions: {
          app: 'assets',
          resource: 'asset'
        },
        extraQuery: {
          ...extraQuery,
          ...this.extraQuery
        },
        columnsExclude: ['spec_info', 'auto_config'],
        columnsShow: {
          min: ['name', 'address', 'actions'],
          default: [
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
            label: this.$t('HardwareInfo'),
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
            label: this.$t('Accounts'),
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
                return this.$axios.delete(url)
              },
              extraActions: [
                {
                  name: 'Test',
                  title: this.$t('Test'),
                  can: ({ row }) =>
                    this.$hasPerm('assets.test_assetconnectivity') &&
                    !this.$store.getters.currentOrgIsRoot &&
                    row?.auto_config?.ansible_enabled &&
                    row?.auto_config?.ping_enabled,
                  callback: ({ row }) => {
                    if (row.platform.name === 'Gateway') {
                      this.gatewayVisible = true
                      const port = row.protocols.find(item => item.name === 'ssh').port
                      if (!port) {
                        return this.$message.error(this.$tc('BadRequestErrorMsg'))
                      } else {
                        this.gatewayPort = port
                        this.gatewayCell = row.id
                      }
                    } else {
                      this.$axios.post(
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
                ...this.addExtraMoreColActions
              ]
            }
          }
        }
      },
      defaultHeaderActions: {
        onCreate: () => {
          this.showPlatform = true
        },
        hasLabelSearch: true,
        searchConfig: {
          getUrlQuery: false
        },
        hasCreate: false,
        extraActions: [
          {
            name: 'platform',
            title: 'Create',
            type: 'primary',
            icon: '',
            split: true,
            callback: () => {
              this.showPlatform = true
            },
            dropdown: [
              {
                name: 'All',
                title: this.$t('All'),
                callback: () => {
                  console.log('All')
                }
              },
              {
                name: 'Gateway',
                title: this.$t('Gateway'),
                callback: () => {
                  this.$router.push({ query: { platform: 'Gateway' }})
                }
              },
              {
                name: 'Server',
                title: this.$t('Server'),
                callback: () => {
                  this.$router.push({ query: { platform: 'Server' }})
                }
              }
            ]
          }
        ],
        extraMoreActions: [
          {
            name: 'TestSelected',
            title: this.$t('TestSelected'),
            type: 'primary',
            icon: 'fa fa-link',
            can: ({ selectedRows }) =>
              this.$hasPerm('assets.test_assetconnectivity') &&
              !this.$store.getters.currentOrgIsRoot &&
              selectedRows.length > 0 &&
              selectedRows[0].auto_config?.ansible_enabled &&
              selectedRows[0].auto_config?.ping_enabled,
            callback: function({ selectedRows }) {
              const ids = selectedRows.map(v => {
                return v.id
              })
              this.$axios.post(
                '/api/v1/assets/assets/tasks/',
                { action: 'test', assets: ids }).then(res => {
                openTaskPage(res['task'])
              }).catch(err => {
                this.$message.error(this.$tc('common.bulkVerifyErrorMsg' + ' ' + err))
              })
            }.bind(this)
          },
          {
            name: 'DeactiveSelected',
            title: this.$t('DisableSelected'),
            type: 'primary',
            icon: 'fa fa-ban',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 && vm.$hasPerm('assets.change_asset')
            },
            callback: function({ selectedRows }) {
              const ids = selectedRows.map((v) => {
                return { pk: v.id, is_active: false }
              })
              this.$axios.patch(`/api/v1/assets/assets/`, ids).then(res => {
                this.$message.success(this.$tc('UpdateSuccessMsg'))
                this.$refs.ListTable.reloadTable()
              }).catch(err => {
                this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          },
          {
            name: 'ActiveSelected',
            title: this.$t('ActivateSelected'),
            type: 'primary',
            icon: 'fa fa-check-circle-o',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 && vm.$hasPerm('assets.change_asset')
            },
            callback: function({ selectedRows }) {
              const ids = selectedRows.map((v) => {
                return { pk: v.id, is_active: true }
              })
              this.$axios.patch(`/api/v1/assets/assets/`, ids).then(res => {
                this.$message.success(this.$tc('UpdateSuccessMsg'))
                this.$refs.ListTable.reloadTable()
              }).catch(err => {
                this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          },
          {
            name: 'actionUpdateSelected',
            title: this.$t('UpdateSelected'),
            icon: 'batch-update',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 &&
                !this.$store.getters.currentOrgIsRoot &&
                vm.$hasPerm('assets.change_asset')
            },
            callback: ({ selectedRows }) => {
              vm.updateSelectedDialogSetting.selectedRows = selectedRows
              vm.updateSelectedDialogSetting.visible = true
            }
          }
        ]
      },
      updateSelectedDialogSetting: {
        visible: false,
        category: this.category,
        selectedRows: []
      },
      discoveryDialog: {
        visible: false,
        asset: ''
      }
    }
  },
  computed: {
    iTableConfig() {
      return _.merge(this.defaultConfig, this.tableConfig, {
        url: this.url,
        ...(this.category && { category: this.category })
      })
    },
    iHeaderActions() {
      const actions = _.merge({}, this.defaultHeaderActions, this.headerActions)
      if (this.addExtraMoreActions) {
        actions.extraMoreActions = [...actions.extraMoreActions, ...this.addExtraMoreActions]
      }
      return actions
    }
  },
  watch: {
    optionInfo(iNew) {
      this.$set(this.defaultConfig.columnsMeta.gathered_info.formatterArgs, 'info', iNew)
    },
    $route(iNew, old) {
      const tab = iNew.query.tab
      const oldTab = old.query.tab
      if (tab !== oldTab && tab !== 'all') {
        iNew.query.node_id = ''
        this.$router.push(iNew)
      }
    }
  },
  methods: {
    handleAssetBulkUpdate() {
      this.updateSelectedDialogSetting.visible = false
      this.$refs.ListTable.reloadTable()
    }
  }
}
</script>
