<template>
  <div>
    <GenericTreeListPage ref="TreeList" :table-config="tableConfig" :help-message="helpMessage" :header-actions="headerActions" :tree-setting="treeSetting">
      <div slot="rMenu">
        <li class="divider" />
        <li id="m_add_asset_to_node" class="rmenu" tabindex="-1" @click="rMenuAddAssetToNode">
          <i class="fa fa-clone" />  {{ this.$t('tree.AddAssetToNode') }}
        </li>
        <li id="m_move_asset_to_node" class="rmenu" tabindex="-1" @click="rMenuMoveAssetToNode">
          <i class="fa fa-scissors" />  {{ this.$t('tree.MoveAssetToNode') }}
        </li>
        <li class="divider" />
        <li id="m_update_node_asset_hardware_info" class="rmenu" tabindex="-1" @click="rMenuUpdateNodeAssetHardwareInfo">
          <i class="fa fa-refresh" />  {{ this.$t('tree.UpdateNodeAssetHardwareInfo') }}
        </li>
        <li id="m_test_node_asset_connectivity" class="rmenu" tabindex="-1" @click="rMenuTestNodeAssetConnectivity">
          <i class="fa fa-link" />  {{ this.$t('tree.TestNodeAssetConnectivity') }}
        </li>
        <li class="divider" />
        <li id="m_show_asset_only_current_node" class="rmenu" tabindex="-1" @click="rMenuShowAssetOnlyCurrentNode">
          <i class="fa fa-indent" />  {{ this.$t('tree.ShowAssetOnlyCurrentNode') }}
        </li>
        <li id="m_show_asset_all_children_node" class="rmenu" tabindex="-1" @click="rMenuShowAssetAllChildrenNode">
          <i class="fa fa-align-justify" />  {{ this.$t('tree.ShowAssetAllChildrenNode') }}
        </li>
        <li class="divider" />
        <li id="m_check_assets_amount" class="rmenu" tabindex="-1" @click="rCheckAssetsAmount">
          <i class="fa fa-clone" />  {{ this.$t('tree.CheckAssetsAmount') }}
        </li>
        <li id="m_show_node_info" class="rmenu" tabindex="-1" @click="rMenuShowNodeInfo">
          <i class="fa fa-info-circle" />  {{ this.$t('tree.ShowNodeInfo') }}
        </li>
      </div>
    </GenericTreeListPage>
    <Dialog width="30%" :title="this.$t('assets.NodeInformation')" :visible.sync="nodeInfoDialogSetting.dialogVisible" :show-cancel="false" :show-confirm="false">
      <el-row v-for="item in nodeInfoDialogSetting.items" :key="'card-' + item.key" :gutter="10" class="item">
        <el-col :span="6"><div class="item-label"><label>{{ item.label }}: </label></div></el-col>
        <el-col :span="18"><div class="item-text">{{ item.value }}</div></el-col>
      </el-row>
    </Dialog>
    <div class="asset-select-dialog">
      <Dialog
        v-if="assetTreeTableDialogSetting.dialogVisible"
        :title="this.$t('assets.Assets')"
        :visible.sync="assetTreeTableDialogSetting.dialogVisible"
        width="70%"
        top="1vh"
        @confirm="assetTreeTableDialogHandleConfirm"
        @cancel="assetTreeTableDialogHandleCancel"
      >
        <TreeTable
          ref="TreeTable"
          :tree-setting="assetTreeTableDialogSetting.treeSetting"
          :table-config="assetTreeTableDialogSetting.tableConfig"
          :header-actions="assetTreeTableDialogSetting.headerActions"
        />
      </Dialog>
    </div>
    <GenericUpdateFormDialog
      v-if="updateSelectedDialogSetting.dialogSetting.dialogVisible"
      :selected-rows="updateSelectedDialogSetting.selectedRows"
      :form-setting="updateSelectedDialogSetting.formSetting"
      :dialog-setting="updateSelectedDialogSetting.dialogSetting"
    />
  </div>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage/index'
import { DetailFormatter, ActionsFormatter, BooleanFormatter } from '@/components/ListTable/formatters'
import $ from '@/utils/jquery-vendor'
import Dialog from '@/components/Dialog'
import TreeTable from '@/components/TreeTable'
import { GenericUpdateFormDialog } from '@/layout/components'
import rules from '@/components/DataForm/rules'
import Protocols from '@/views/assets/Asset/components/Protocols/index'

export default {
  components: {
    GenericTreeListPage,
    Dialog,
    TreeTable,
    GenericUpdateFormDialog
  },
  data() {
    const vm = this
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
            },
            showOverflowTooltip: true
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
            width: '90px',
            align: 'center'
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
                  callback: function({ cellValue, tableData }) {
                    return this.$router.push({ name: 'AssetMoreInformationEdit', params: { id: cellValue }})
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        createRoute: {
          name: 'AssetCreate',
          query: this.$route.query
        },
        searchConfig: {
          options: [
            { label: this.$t('assets.Label'), value: 'label' }
          ]
        },
        extraMoreActions: [
          {
            name: 'DeactiveSelected',
            title: this.$t('assets.DeactiveSelected'),
            type: 'primary',
            can: ({ selectedRows }) => selectedRows.length > 0,
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
            can: ({ selectedRows }) => selectedRows.length > 0,
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
            name: 'updateSelected',
            title: this.$t('common.updateSelected'),
            can: ({ selectedRows }) => selectedRows.length > 0,
            callback: ({ selectedRows, reloadTable }) => {
              vm.updateSelectedDialogSetting.dialogSetting.dialogVisible = true
              vm.updateSelectedDialogSetting.selectedRows = selectedRows
            }
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
      nodeInfoDialogSetting: {
        dialogVisible: false,
        items: []
      },
      assetTreeTableDialogSetting: {
        dialogVisible: false,
        assetsSelected: [],
        action: '',
        treeSetting: {
          showMenu: false,
          showRefresh: true,
          showAssets: false,
          url: '/api/v1/assets/assets/?fields_size=mini',
          nodeUrl: '/api/v1/assets/nodes/',
          // ?assets=0不显示资产. =1显示资产
          treeUrl: '/api/v1/assets/nodes/children/tree/?assets=0'
        },
        tableConfig: {
          url: '/api/v1/assets/assets/',
          hasTree: true,
          columns: [
            {
              prop: 'hostname',
              label: this.$t('assets.Hostname'),
              sortable: true,
              formatter: DetailFormatter,
              formatterArgs: {
                route: 'AssetDetail'
              }
            },
            {
              prop: 'ip',
              label: this.$t('assets.ip'),
              sortable: 'custom'
            }
          ],
          listeners: {
            'toggle-row-selection': (isSelected, row) => {
              if (isSelected) {
                this.addRowToAssetsSelected(row)
              } else {
                this.removeRowFromAssetsSelected(row)
              }
            }
          }
        },
        headerActions: {
          hasLeftActions: false,
          hasRightActions: false
        }
      },
      updateSelectedDialogSetting: {
        selectedRows: [],
        dialogSetting: {
          dialogVisible: false
        },
        formSetting: {
          url: '/api/v1/assets/assets/',
          hasSaveContinue: false,
          initial: {
            platform: 'Linux',
            protocols: ['ssh/22']
          },
          fields: [
            'platform', 'protocols', 'domain', 'admin_user', 'labels', 'comment'
          ],
          fieldsMeta: {
            platform: {
              label: this.$t('assets.Platform'),
              hidden: () => false,
              el: {
                multiple: false,
                ajax: {
                  url: '/api/v1/assets/platforms/',
                  transformOption: (item) => {
                    return { label: `${item.name}`, value: item.name }
                  }
                }
              }
            },
            protocols: {
              label: this.$t('assets.Protocols'),
              component: Protocols
            },
            domain: {
              label: this.$t('assets.Domain'),
              hidden: () => false,
              el: {
                multiple: false,
                ajax: {
                  url: '/api/v1/assets/domains/'
                }
              }
            },
            admin_user: {
              rules: [rules.RequiredChange],
              label: this.$t('assets.AdminUser'),
              hidden: () => false,
              el: {
                multiple: false,
                ajax: {
                  url: '/api/v1/assets/admin-users/',
                  transformOption: (item) => {
                    return { label: `${item.name}(${item.username})`, value: item.id }
                  }
                }
              }
            },
            labels: {
              label: this.$t('assets.Label'),
              hidden: () => false,
              el: {
                ajax: {
                  url: '/api/v1/assets/labels/'
                }
              }
            },
            comment: {
              label: this.$t('common.Comment'),
              hidden: () => false
            }
          }
        }
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
    rMenuAddAssetToNode: function() {
      this.assetTreeTableDialogSetting.dialogVisible = true
      this.assetTreeTableDialogSetting.action = 'add'
    },
    rMenuMoveAssetToNode: function() {
      this.assetTreeTableDialogSetting.dialogVisible = true
      this.assetTreeTableDialogSetting.action = 'move'
    },
    rMenuUpdateNodeAssetHardwareInfo: function() {
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
    rMenuTestNodeAssetConnectivity: function() {
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
    rMenuShowAssetOnlyCurrentNode: function() {
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
    rMenuShowAssetAllChildrenNode: function() {
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
    rMenuShowNodeInfo: function() {
      this.hideRMenu()
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$axios.get(
        `/api/v1/assets/nodes/${currentNode.meta.node.id}/`
      ).then(res => {
        this.nodeInfoDialogSetting.dialogVisible = true
        this.nodeInfoDialogSetting.items = [
          { key: 'id', label: 'ID', value: res.id },
          { key: 'name', label: this.$t('assets.Name'), value: res.name },
          { key: 'fullName', label: this.$t('assets.FullName'), value: res.full_value },
          { key: 'key', label: this.$t('assets.Key'), value: res.key }
        ]
      }).catch(error => {
        this.$message.error(this.$t('common.getErrorMsg' + ' ' + error))
      })
    },
    rCheckAssetsAmount: function() {
      this.$axios.post(
        `/api/v1/assets/nodes/launch_check_assets_amount_task/`
      ).then(res => {
        window.open(`/#/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
      }).catch(error => {
        this.$message.error(this.$t('common.getErrorMsg' + ' ' + error))
      })
    },
    addRowToAssetsSelected(row) {
      const selectValueIndex = this.assetTreeTableDialogSetting.assetsSelected.indexOf(row.id)
      if (selectValueIndex === -1) {
        this.assetTreeTableDialogSetting.assetsSelected.push(row.id)
      }
    },
    removeRowFromAssetsSelected(row) {
      const selectValueIndex = this.assetTreeTableDialogSetting.assetsSelected.indexOf(row.id)
      if (selectValueIndex > -1) {
        this.assetTreeTableDialogSetting.assetsSelected.splice(selectValueIndex, 1)
      }
    },
    assetTreeTableDialogHandleConfirm() {
      const currentNode = this.getSelectedNodes()[0]
      const assetsSelected = this.assetTreeTableDialogSetting.assetsSelected
      if (!currentNode || assetsSelected.length === 0) {
        return
      }
      let url = `/api/v1/assets/nodes/${currentNode.meta.node.id}/assets/add/`
      if (this.assetTreeTableDialogSetting.action === 'move') {
        url = `/api/v1/assets/nodes/${currentNode.meta.node.id}/assets/replace/`
      }
      this.$axios.put(
        url, { assets: assetsSelected }
      ).then(res => {
        this.assetTreeTableDialogSetting.dialogVisible = false
        this.assetTreeTableDialogSetting.assetsSelected = []
        $('#tree-refresh').trigger('click')
        this.$message.success(this.$t('common.updateSuccessMsg'))
      }).catch(error => {
        this.$message.error(this.$t('common.updateErrorMsg' + ' ' + error))
      })
    },
    assetTreeTableDialogHandleCancel() {
      this.assetTreeTableDialogSetting.dialogVisible = false
      this.assetTreeTableDialogSetting.assetsSelected = []
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
