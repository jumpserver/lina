<template>
  <div>
    <GenericTreeListPage
      ref="TreeList"
      :table-config="tableConfig"
      :help-message="helpMessage"
      :header-actions="headerActions"
      :tree-setting="treeSetting"
    >
      <TreeMenu
        slot="rMenu"
        :tree="treeRef"
        @showAll="showAll"
      />
    </GenericTreeListPage>

    <AssetBulkUpdateDialog
      :visible.sync="updateSelectedDialogSetting.visible"
      v-bind="updateSelectedDialogSetting"
    />
  </div>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage/index'
import { DetailFormatter, ActionsFormatter, TagsFormatter } from '@/components/TableFormatters'
import $ from '@/utils/jquery-vendor'
import { mapGetters } from 'vuex'
import { connectivityMeta } from '@/components/AccountListTable/const'
import AssetBulkUpdateDialog from './AssetBulkUpdateDialog'
import TreeMenu from './TreeMenu'

export default {
  components: {
    GenericTreeListPage,
    AssetBulkUpdateDialog,
    TreeMenu
  },
  data() {
    const vm = this
    return {
      treeRef: null,
      treeSetting: {
        showMenu: true,
        showRefresh: true,
        showAssets: false,
        showCreate: true,
        showUpdate: true,
        showDelete: true,
        hasRightMenu: true,
        url: '/api/v1/assets/assets/',
        nodeUrl: '/api/v1/assets/nodes/',
        // ?assets=0不显示资产. =1显示资产
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=0'
      },
      tableConfig: {
        url: '/api/v1/assets/assets/',
        hasTree: true,
        columns: [
          'hostname', 'ip', 'public_ip', 'admin_user_display',
          'protocols', 'platform', 'hardware_info', 'model',
          'cpu_model', 'cpu_cores', 'cpu_count', 'cpu_vcpus',
          'disk_info', 'disk_total', 'memory', 'os', 'os_arch',
          'os_version', 'number', 'vendor', 'sn', 'is_active',
          'connectivity', 'labels_display',
          'created_by', 'date_created', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['hostname', 'ip', 'actions'],
          default: [
            'hostname', 'ip', 'platform', 'protocols', 'hardware_info',
            'connectivity', 'actions'
          ]
        },
        columnsMeta: {
          hostname: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AssetDetail'
            },
            showOverflowTooltip: true,
            sortable: true
          },
          platform: {
            sortable: true
          },
          protocols: {
            formatter: function(row) {
              return <span> {row.protocols.toString()} </span>
            }
          },
          ip: {
            sortable: 'custom',
            width: '140px'
          },
          hardware_info: {
            showOverflowTooltip: true
          },
          cpu_model: {
            showOverflowTooltip: true
          },
          sn: {
            showOverflowTooltip: true
          },
          comment: {
            showOverflowTooltip: true
          },
          connectivity: connectivityMeta,
          labels_display: {
            formatter: TagsFormatter
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/assets/${id}/`
                return this.$axios.delete(url)
              },
              extraActions: [
                {
                  name: 'View',
                  title: this.$t(`common.UpdateAssetDetail`),
                  type: 'primary',
                  can: vm.$hasPerm('assets.refresh_assethardwareinfo'),
                  callback: function({ cellValue, tableData, row }) {
                    return this.$router.push({
                      name: 'AssetMoreInformationEdit',
                      params: { id: row.id }
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        createRoute: () => {
          return {
            name: 'AssetCreate',
            query: this.$route.query
          }
        },
        createInNewPage: true,
        searchConfig: {
          options: [
            { label: this.$t('assets.Label'), value: 'label' }
          ]
        },
        extraActions: [
          {
            name: this.$t('xpack.Cloud.CloudSync'),
            title: this.$t('xpack.Cloud.CloudSync'),
            has: () => vm.$hasPerm('xpack.view_account') && vm.$hasLicense(),
            callback: () => this.$router.push({ name: 'CloudCenter' })
          }
        ],
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
                this.$message.success(this.$t('common.updateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
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
                this.$message.success(this.$t('common.updateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
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
          },
          {
            name: 'RemoveFromCurrentNode',
            title: this.$t('assets.RemoveFromCurrentNode'),
            can: ({ selectedRows }) => {
              if (!vm.$route.query.node) {
                return false
              }
              return selectedRows.length > 0 &&
                !vm.currentOrgIsRoot &&
                vm.$hasPerm('assets.change_node')
            },
            callback: function({ selectedRows, reloadTable }) {
              const assetsId = []
              for (const item of selectedRows) {
                assetsId.push(item.id)
              }
              const nodeId = this.$route.query.node
              if (!nodeId) {
                return
              }
              const url = `/api/v1/assets/nodes/${nodeId}/assets/remove/`
              this.$axios.put(url, { assets: assetsId }).then(res => {
                this.$message.success(this.$t('common.removeSuccessMsg'))
                reloadTable()
              }).catch(err => {
                this.$message.error(this.$t('common.removeErrorMsg' + ' ' + err))
              })
            }.bind(this)
          }
        ]
      },
      helpMessage: this.$t('assets.AssetListHelpMessage'),
      updateSelectedDialogSetting: {
        visible: false,
        selectedRows: []
      }
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot'])
  },
  mounted() {
    this.decorateRMenu()
    this.treeSetting.hasRightMenu = !this.currentOrgIsRoot
    this.treeSetting.showCreate = this.$hasPerm('assets.add_node')
    this.treeSetting.showUpdate = this.$hasPerm('assets.change_node')
    this.treeSetting.showDelete = this.$hasPerm('assets.delete_node')
    this.treeRef = this.$refs.TreeList
  },
  methods: {
    decorateRMenu() {
      const show_current_asset = this.$cookie.get('show_current_asset') || '0'
      if (show_current_asset === '1') {
        $('#m_show_asset_all_children_node').css('color', '#606266')
        $('#m_show_asset_only_current_node').css('color', 'green')
      } else {
        $('#m_show_asset_all_children_node').css('color', 'green')
        $('#m_show_asset_only_current_node').css('color', '#606266')
      }
    },
    showAll({ node, showCurrentAsset }) {
      this.$cookie.set('show_current_asset', showCurrentAsset, 1)
      this.decorateRMenu()
      const url = `${this.treeSetting.url}?node_id=${node.meta.data.id}&show_current_asset=${showCurrentAsset}`
      this.$refs.TreeList.$refs.TreeTable.handleUrlChange(url)
    }
  }
}
</script>

<style lang="scss" scoped>
.asset-select-dialog >>> .transition-box:first-child {
  background-color: #f3f3f3;
}
</style>
