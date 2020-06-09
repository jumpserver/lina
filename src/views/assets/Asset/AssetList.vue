<template>
  <div>
    <GenericTreeListPage ref="TreeList" :table-config="tableConfig" :help-message="helpMessage" :header-actions="headerActions" :tree-setting="treeSetting">
      <div slot="rMenu">
        <li class="divider" />
        <li id="m_add_asset_to_node" class="rmenu" tabindex="-1" @click="addAssetToNode">
          <i class="fa fa-clone" />  {{ this.$t('tree.AddAssetToNode') }}
        </li>
        <li id="m_move_asset_to_node" class="rmenu" tabindex="-1" @click="moveAssetToNode">
          <i class="fa fa-scissors" />  {{ this.$t('tree.moveAssetToNode') }}
        </li>
        <li class="divider" />
        <li id="m_update_node_asset_hardware_info" class="rmenu" tabindex="-1" @click="updateNodeAssetHardwareInfo">
          <i class="fa fa-refresh" />  {{ this.$t('tree.updateNodeAssetHardwareInfo') }}
        </li>
        <li id="m_test_node_asset_connectivity" class="rmenu" tabindex="-1" @click="testNodeAssetConnectivity">
          <i class="fa fa-link" />  {{ this.$t('tree.testNodeAssetConnectivity') }}
        </li>
        <li class="divider" />
        <li id="m_show_asset_only_current_node" class="rmenu" tabindex="-1" @click="showAssetOnlyCurrentNode">
          <i class="fa fa-indent" />  {{ this.$t('tree.showAssetOnlyCurrentNode') }}
        </li>
        <li id="m_show_asset_all_children_node" class="rmenu" tabindex="-1" @click="showAssetAllChildrenNode">
          <i class="fa fa-align-justify" />  {{ this.$t('tree.showAssetAllChildrenNode') }}
        </li>
        <li class="divider" />
        <li id="m_show_node_info" class="rmenu" tabindex="-1" @click="showNodeInfo">
          <i class="fa fa-info-circle" />  {{ this.$t('tree.showNodeInfo') }}
        </li>
      </div>
    </GenericTreeListPage>
    <Dialog width="30%" :title="this.$t('assets.NodeInformation')" :visible.sync="nodeInfoDialog.dialogVisible" :show-cancel="false" :show-confirm="false">
      <el-row v-for="item in nodeInfoDialog.items" :key="'card-' + item.key" :gutter="10" class="item">
        <el-col :span="6"><div class="item-label"><label>{{ item.label }}: </label></div></el-col>
        <el-col :span="18"><div class="item-text">{{ item.value }}</div></el-col>
      </el-row>
    </Dialog>
  </div>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage/index'
import { DetailFormatter, ActionsFormatter, BooleanFormatter } from '@/components/ListTable/formatters'
import $ from '@/utils/jquery-vendor'
import Dialog from '@/components/Dialog'

export default {
  components: {
    GenericTreeListPage,
    Dialog
  },
  data() {
    return {
      treeSetting: {
        showMenu: true,
        showRefresh: true,
        showAssets: false,
        url: '/api/v1/assets/assets/',
        nodeUrl: '/api/v1/assets/nodes/',
        // ?assets=0不显示资产. =1显示资产
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=0'
      },
      tableConfig: {
        url: '/api/v1/assets/assets/',
        hasTree: true,
        columns: [
          'hostname', 'ip', 'hardware_info', 'connectivity', 'actions'
        ],
        columnsMeta: {
          hostname: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AssetDetail'
            }
          },
          ip: {
            sortable: 'custom',
            width: '140px'
          },
          hardware_info: {
            showOverflowTooltip: true
          },
          connectivity: {
            label: this.$t('assets.Reachable'),
            formatter: BooleanFormatter,
            formatterArgs: {
              iconChoices: {
                0: 'fa-times text-danger',
                1: 'fa-check text-primary',
                2: 'fa-circle text-warning'
              },
              typeChange: function(val) {
                return val.status
              },
              hasTips: true
            },
            width: '80px',
            align: 'center'
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/assets/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        }
      },
      headerActions: {
        createRoute: {
          name: 'AssetCreate',
          query: this.$route.query
        },
        extraMoreActions: [
          {
            name: 'DeactiveSelected',
            title: this.$t('assets.DeactiveSelected'),
            type: 'primary',
            can: ({ selectedRows }) => selectedRows.length > 0,
            callback: function({ selectedRows }) {
              console.log(selectedRows)
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
            can: ({ selectedRows }) => selectedRows.length > 0,
            callback: function({ selectedRows }) {
              console.log(selectedRows)
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
            name: 'RemoveFromCurrentNode',
            title: this.$t('assets.RemoveFromCurrentNode'),
            can: ({ selectedRows }) => {
              if (!this.$route.query.node) {
                return false
              }
              return selectedRows.length > 0
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
      nodeInfoDialog: {
        dialogVisible: false,
        items: []
      }
    }
  },
  mounted() {
    this.decorateRMenu()
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
    addAssetToNode: function() {

    },
    moveAssetToNode: function() {

    },
    updateNodeAssetHardwareInfo: function() {
      this.hideRMenu()
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$axios.post(
        `/api/v1/assets/nodes/${currentNode.meta.node.id}/tasks/`,
        { 'action': 'refresh' }
      ).then((res) => {
        window.open(`/core/ops/celery/task/${res.task}/log/`, '_blank', 'toolbar=yes, width=900, height=600')
      }).catch(error => {
        this.$message.error(this.$t('common.updateErrorMsg' + ' ' + error))
      })
    },
    testNodeAssetConnectivity: function() {
      this.hideRMenu()
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$axios.post(
        `/api/v1/assets/nodes/${currentNode.meta.node.id}/tasks/`,
        { 'action': 'test' }
      ).then((res) => {
        window.open(`/core/ops/celery/task/${res.task}/log/`, '_blank', 'toolbar=yes, width=900, height=600')
      }).catch(error => {
        this.$message.error(this.$t('common.updateErrorMsg' + ' ' + error))
      })
    },
    showAssetOnlyCurrentNode: function() {
      this.hideRMenu()
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$cookie.set('show_current_asset', '1', 1)
      this.decorateRMenu()
      const url = `${this.treeSetting.url}?node_id=${currentNode.meta.node.id}&show_current_asset=1`
      this.$refs.TreeList.$refs.TreeTable.handleUrlChange(url)
    },
    showAssetAllChildrenNode: function() {
      this.hideRMenu()
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$cookie.set('show_current_asset', '0', 1)
      this.decorateRMenu()
      const url = `${this.treeSetting.url}?node_id=${currentNode.meta.node.id}&show_current_asset=0`
      this.$refs.TreeList.$refs.TreeTable.handleUrlChange(url)
    },
    showNodeInfo: function() {
      this.hideRMenu()
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      console.log('....')
      this.$axios.get(
        `/api/v1/assets/nodes/${currentNode.meta.node.id}/`
      ).then(res => {
        this.nodeInfoDialog.dialogVisible = true
        this.nodeInfoDialog.items = [
          { key: 'id', label: 'ID', value: res.id },
          { key: 'name', label: this.$t('assets.Name'), value: res.name },
          { key: 'fullName', label: this.$t('assets.FullName'), value: res.full_value },
          { key: 'key', label: this.$t('assets.Key'), value: res.key }
        ]
      }).catch(error => {
        this.$message.error(this.$t('common.getErrorMsg' + ' ' + error))
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

  .el-row {
    margin-bottom: 20px;
    &:last-child {
     margin-bottom: 0;
    }
  }
</style>
