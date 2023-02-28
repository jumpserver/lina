<template>
  <div>
    <el-alert v-if="helpMessage" type="success">
      <span class="announcement-main" v-html="helpMessage" />
    </el-alert>
    <ListTable ref="ListTable" :header-actions="iHeaderActions" :table-config="iTableConfig" />
    <PlatformDialog :category="category" :visible.sync="showPlatform" />
    <AssetBulkUpdateDialog
      :visible.sync="updateSelectedDialogSetting.visible"
      v-bind="updateSelectedDialogSetting"
    />
    <GatewayDialog
      :cell="GatewayCell"
      :port="GatewayPort"
      :visible.sync="GatewayVisible"
    />
  </div>
</template>

<script>
import { ListTable } from '@/components'
import {
  ActionsFormatter, ArrayFormatter, ChoicesFormatter, DetailFormatter, ProtocolsFormatter, TagsFormatter
} from '@/components/TableFormatters'
import AssetBulkUpdateDialog from './AssetBulkUpdateDialog'
import { connectivityMeta } from '@/components/AccountListTable/const'
import PlatformDialog from '../components/PlatformDialog'
import GatewayDialog from '@/components/GatewayDialog'
import { openTaskPage } from '@/utils/jms'
import HostInfoFormatter from '@/components/TableFormatters/HostInfoFormatter'

export default {
  components: {
    ListTable,
    GatewayDialog,
    PlatformDialog,
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
    helpMessage: {
      type: String,
      default: ''
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
        route.query.platform = row.platform.id
        route.query.platform_type = row.type.value
      } else if (action === 'Update') {
        route.params.id = row.id
        route.query.platform = row.platform.id
        route.query.platform_type = row.type.value
      }
      vm.$router.push(route)
    }
    return {
      showPlatform: false,
      GatewayPort: 0,
      GatewayCell: '',
      GatewayVisible: false,
      defaultConfig: {
        url: '/api/v1/assets/hosts/',
        permissions: {
          app: 'assets',
          resource: 'asset'
        },
        columnsExclude: ['spec_info', 'auto_info'],
        columnsShow: {
          min: ['name', 'address', 'actions'],
          default: [
            'name', 'address', 'platform',
            'connectivity', 'actions'
          ]
        },
        columnsMeta: {
          type: { formatter: ChoicesFormatter },
          category: { formatter: ChoicesFormatter },
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AssetDetail'
            },
            sortable: true
          },
          platform: {
            sortable: true
          },
          protocols: {
            showFullContent: true,
            formatter: ProtocolsFormatter
          },
          nodes_display: {
            formatter: ArrayFormatter
          },
          info: {
            label: this.$t('assets.HardwareInfo'),
            formatter: HostInfoFormatter,
            formatterArgs: {
              fieldName: 'info'
            }
          },
          connectivity: connectivityMeta,
          labels_display: {
            formatter: TagsFormatter
          },
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
                  title: this.$t('common.Test'),
                  can: ({ row }) =>
                    this.$hasPerm('assets.test_assetconnectivity') &&
                    !this.$store.getters.currentOrgIsRoot &&
                    row['auto_info'].ansible_enabled &&
                    row['auto_info'].ping_enabled,
                  callback: ({ row }) => {
                    if (row.platform.name === 'Gateway') {
                      this.GatewayVisible = true
                      const port = row.protocols.find(item => item.name === 'ssh').port
                      if (!port) {
                        return this.$message.error(this.$tc('common.BadRequestErrorMsg'))
                      } else {
                        this.GatewayPort = port
                        this.GatewayCell = row.id
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
                }
              ]
            }
          }
        }
      },
      defaultHeaderActions: {
        onCreate: () => {
          this.showPlatform = true
        },
        searchConfig: {
          getUrlQuery: false
        },
        extraMoreActions: [
          {
            name: 'DeactiveSelected',
            title: this.$t('assets.DeactiveSelected'),
            type: 'primary',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 && vm.$hasPerm('assets.change_asset')
            },
            callback: function({ selectedRows }) {
              const ids = selectedRows.map((v) => {
                return { pk: v.id, is_active: false }
              })
              this.$axios.patch(`/api/v1/assets/assets/`, ids).then(res => {
                this.$message.success(this.$tc('common.updateSuccessMsg'))
                this.$refs.ListTable.reloadTable()
              }).catch(err => {
                this.$message.error(this.$tc('common.updateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          },
          {
            name: 'ActiveSelected',
            title: this.$t('assets.ActiveSelected'),
            type: 'primary',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 && vm.$hasPerm('assets.change_asset')
            },
            callback: function({ selectedRows }) {
              const ids = selectedRows.map((v) => {
                return { pk: v.id, is_active: true }
              })
              this.$axios.patch(`/api/v1/assets/assets/`, ids).then(res => {
                this.$message.success(this.$tc('common.updateSuccessMsg'))
                this.$refs.ListTable.reloadTable()
              }).catch(err => {
                this.$message.error(this.$tc('common.updateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          },
          {
            name: 'actionUpdateSelected',
            title: this.$t('common.updateSelected'),
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 &&
                !vm.currentOrgIsRoot &&
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
  }
}
</script>

<style>

</style>
