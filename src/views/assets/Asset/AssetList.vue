<template>
  <div>
    <GenericTreeListPage ref="TreeList" :table-config="tableConfig" :help-message="helpMessage" :header-actions="headerActions" :tree-setting="treeSetting">
      <div slot="rMenu">
        <!--        <li class="divider" />-->
        <li id="m_add_asset_to_node" v-perms="'assets.add_assettonode'" class="rmenu" tabindex="-1" @click="rMenuAddAssetToNode">
          <i class="fa fa-clone" />  {{ this.$t('tree.AddAssetToNode') }}
        </li>
        <li id="m_move_asset_to_node" v-perms="'assets.move_assettonode'" class="rmenu" tabindex="-1" @click="rMenuMoveAssetToNode">
          <i class="fa fa-scissors" />  {{ this.$t('tree.MoveAssetToNode') }}
        </li>
        <li v-if="$hasPerm('assets.move_assettonode | assets.add_assettonode')" class="divider" />
        <li id="m_update_node_asset_hardware_info" v-perms="'assets.refresh_assethardwareinfo'" class="rmenu" tabindex="-1" @click="rMenuUpdateNodeAssetHardwareInfo">
          <i class="fa fa-refresh" />  {{ this.$t('tree.UpdateNodeAssetHardwareInfo') }}
        </li>
        <li id="m_test_node_asset_connectivity" v-perms="'assets.test_assetconnectivity'" class="rmenu" tabindex="-1" @click="rMenuTestNodeAssetConnectivity">
          <i class="fa fa-link" />  {{ this.$t('tree.TestNodeAssetConnectivity') }}
        </li>
        <li v-if="$hasPerm('assets.add_assettonode | assets.test_assetconnectivity')" class="divider" />
        <li id="m_show_asset_only_current_node" class="rmenu" tabindex="-1" @click="rMenuShowAssetOnlyCurrentNode">
          <i class="fa fa-indent" />  {{ this.$t('tree.ShowAssetOnlyCurrentNode') }}
        </li>
        <li id="m_show_asset_all_children_node" class="rmenu" tabindex="-1" @click="rMenuShowAssetAllChildrenNode">
          <i class="fa fa-align-justify" />  {{ this.$t('tree.ShowAssetAllChildrenNode') }}
        </li>
        <li class="divider" />
        <li id="m_check_assets_amount" v-perms="'assets.change_node'" class="rmenu" tabindex="-1" @click="rCheckAssetsAmount">
          <i class="fa fa-clone" />  {{ this.$t('tree.CheckAssetsAmount') }}
        </li>
        <li id="m_show_node_info" class="rmenu" tabindex="-1" @click="rMenuShowNodeInfo">
          <i class="fa fa-info-circle" />  {{ this.$t('tree.ShowNodeInfo') }}
        </li>
      </div>
    </GenericTreeListPage>
    <Dialog width="30%" :title="this.$t('assets.NodeInformation')" :visible.sync="nodeInfoDialogSetting.dialogVisible" :show-cancel="false" :show-confirm="false">
      <el-row v-for="item in nodeInfoDialogSetting.items" :key="'card-' + item.key" :gutter="10" class="item">
        <el-col :md="6" :sm="24"><div class="item-label"><label>{{ item.label }}: </label></div></el-col>
        <el-col :md="18" :sm="24"><div class="item-text">{{ item.value }}</div></el-col>
      </el-row>
    </Dialog>
    <AssetBulkUpdateDialog
      :visible.sync="updateSelectedDialogSetting.visible"
      v-bind="updateSelectedDialogSetting"
    />
    <NodeAssetsUpdateDialog
      :visible.sync="nodeAssetsUpdateDialog.visible"
      v-bind="nodeAssetsUpdateDialog"
    />
  </div>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage/index'
import {
  DetailFormatter,
  ActionsFormatter,
  TagsFormatter
} from '@/components/TableFormatters'
import $ from '@/utils/jquery-vendor'
import Dialog from '@/components/Dialog'
import { mapGetters } from 'vuex'
import { connectivityMeta } from '@/components/AccountListTable/const'
import { openTaskPage } from '@/utils/jms'
import AssetBulkUpdateDialog from './AssetBulkUpdateDialog'
import NodeAssetsUpdateDialog from './NodeAssetsUpdateDialog'

export default {
  components: {
    GenericTreeListPage,
    Dialog,
    AssetBulkUpdateDialog,
    NodeAssetsUpdateDialog
  },
  data() {
    const vm = this
    return {
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
          'protocols', 'category', 'type', 'platform', 'sn', 'is_active',
          'connectivity', 'labels_display',
          'created_by', 'date_created', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['hostname', 'ip', 'actions'],
          default: [
            'hostname', 'ip', 'platform', 'category', 'type',
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
                    return this.$router.push({ name: 'AssetMoreInformationEdit', params: { id: row.id }})
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
      nodeInfoDialogSetting: {
        dialogVisible: false,
        items: []
      },
      updateSelectedDialogSetting: {
        visible: false,
        selectedRows: []
      },
      nodeAssetsUpdateDialog: {
        visible: false,
        action: 'add',
        selectNode: null
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
    hideRMenu() {
      this.$refs.TreeList.hideRMenu()
    },
    getSelectedNodes() {
      return this.$refs.TreeList.getSelectedNodes()
    },
    rMenuAddAssetToNode() {
      this.nodeAssetsUpdateDialog.visible = true
      this.nodeAssetsUpdateDialog.action = 'add'
      this.nodeAssetsUpdateDialog.selectNode = this.getSelectedNodes()[0]
    },
    rMenuMoveAssetToNode() {
      this.nodeAssetsUpdateDialog.visible = true
      this.nodeAssetsUpdateDialog.action = 'move'
      this.nodeAssetsUpdateDialog.selectNode = this.getSelectedNodes()[0]
    },
    rMenuUpdateNodeAssetHardwareInfo: function() {
      this.hideRMenu()
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$axios.post(
        `/api/v1/assets/nodes/${currentNode.meta.data.id}/tasks/`,
        { 'action': 'refresh' }
      ).then((res) => {
        openTaskPage(res['task'])
      }).catch(error => {
        this.$message.error(this.$t('common.updateErrorMsg' + ' ' + error))
      })
    },
    rMenuTestNodeAssetConnectivity: function() {
      this.hideRMenu()
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$axios.post(
        `/api/v1/assets/nodes/${currentNode.meta.data.id}/tasks/`,
        { 'action': 'test' }
      ).then((res) => {
        openTaskPage(res['task'])
      }).catch(error => {
        this.$message.error(this.$t('common.updateErrorMsg' + ' ' + error))
      })
    },
    rMenuShowAssetOnlyCurrentNode: function() {
      this.hideRMenu()
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$cookie.set('show_current_asset', '1', 1)
      this.decorateRMenu()
      const url = `${this.treeSetting.url}?node_id=${currentNode.meta.data.id}&show_current_asset=1`
      this.$refs.TreeList.$refs.TreeTable.handleUrlChange(url)
    },
    rMenuShowAssetAllChildrenNode: function() {
      this.hideRMenu()
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$cookie.set('show_current_asset', '0', 1)
      this.decorateRMenu()
      const url = `${this.treeSetting.url}?node_id=${currentNode.meta.data.id}&show_current_asset=0`
      this.$refs.TreeList.$refs.TreeTable.handleUrlChange(url)
    },
    rMenuShowNodeInfo: function() {
      this.hideRMenu()
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$axios.get(
        `/api/v1/assets/nodes/${currentNode.meta.data.id}/`
      ).then(res => {
        this.nodeInfoDialogSetting.dialogVisible = true
        this.nodeInfoDialogSetting.items = [
          { key: 'id', label: 'ID', value: res.id },
          { key: 'name', label: this.$t('assets.Name'), value: res.name },
          { key: 'fullName', label: this.$t('assets.FullName'), value: res.full_value }
        ]
      }).catch(error => {
        this.$message.error(this.$t('common.ErrorMsg' + ' ' + error))
      })
    },
    rCheckAssetsAmount: function() {
      this.$axios.post(
        `/api/v1/assets/nodes/check_assets_amount_task/`
      ).then(res => {
        openTaskPage(res['task'])
      }).catch(error => {
        this.$message.error(this.$t('common.updateErrorMsg' + ' ' + error))
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .rmenu {
    font-size: 12px;
    padding: 0 16px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #606266;
    height: 24px;
    line-height: 24px;
    box-sizing: border-box;
    cursor: pointer;
  }

  .rmenu > a:hover, .dropdown-menu > a:focus {
    color: #262626;
    text-decoration: none;
    background-color: #f5f5f5;
  }
  .rmenu:hover{
    background-color: #f5f7fa;
  }

  .divider{
    margin: 1px 0;
    list-style: none outside none;
    background-color: #e5e5e5;
    height: 1px
  }

  .asset-select-dialog >>> .transition-box:first-child {
    background-color: #f3f3f3 ;
  }

  .el-row {
    margin-bottom: 20px;
    &:last-child {
     margin-bottom: 0;
    }
  }
</style>
