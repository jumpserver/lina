<template>
  <div>
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
    <NodeAssetsUpdateDialog
      :visible.sync="nodeAssetsUpdateDialog.visible"
      v-bind="nodeAssetsUpdateDialog"
    />
    <Dialog
      width="50%"
      :title="this.$t('assets.NodeInformation')"
      :visible.sync="nodeInfoDialogSetting.dialogVisible"
      :show-cancel="false"
      :show-confirm="false"
    >
      <el-row
        v-for="item in nodeInfoDialogSetting.items"
        :key="'card-' + item.key"
        :gutter="10"
        class="item"
      >
        <el-col :md="6" :sm="24">
          <div class="item-label"><label>{{ item.label }}: </label></div>
        </el-col>
        <el-col :md="18" :sm="24">
          <div class="item-text">{{ item.value }}</div>
        </el-col>
      </el-row>
    </Dialog>
  </div>
</template>

<script>
import { openTaskPage } from '@/utils/jms'
import NodeAssetsUpdateDialog from './NodeAssetsUpdateDialog'
import Dialog from '@/components/Dialog'

export default {
  name: 'TreeMenu',
  components: {
    NodeAssetsUpdateDialog,
    Dialog
  },
  props: {
    tree: {
      type: Object,
      require: true,
      default: () => ({})
    }
  },
  data() {
    return {
      nodeAssetsUpdateDialog: {
        visible: false,
        action: 'add',
        selectNode: null
      },
      nodeInfoDialogSetting: {
        dialogVisible: false,
        items: []
      }
    }
  },
  methods: {
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
    rMenuUpdateNodeAssetHardwareInfo() {
      this.hideMenu()
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
    rMenuTestNodeAssetConnectivity() {
      this.hideMenu()
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
    rMenuShowAssetOnlyCurrentNode() {
      this.hideMenu()
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$emit('showAll', { node: currentNode, showCurrentAsset: 1 })
    },
    rMenuShowAssetAllChildrenNode() {
      this.hideMenu()
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$emit('showAll', { node: currentNode, showCurrentAsset: 0 })
    },
    rMenuShowNodeInfo() {
      this.hideMenu()
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
    rCheckAssetsAmount() {
      this.$axios.post(
        `/api/v1/assets/nodes/check_assets_amount_task/`
      ).then(res => {
        openTaskPage(res['task'])
      }).catch(error => {
        this.$message.error(this.$t('common.updateErrorMsg' + ' ' + error))
      })
    },
    hideMenu() {
      console.log('Tree: ', this.tree)
      this.tree.hideRMenu()
    },
    getSelectedNodes() {
      return this.tree.getSelectedNodes()
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

div.rMenu li {
  margin: 6px 0;
  cursor: pointer;
  list-style: none outside none;
}

.rmenu > a:hover, .dropdown-menu > a:focus {
  color: #262626;
  text-decoration: none;
  background-color: #f5f5f5;
}

.rmenu:hover {
  background-color: #f5f7fa;
}

.divider {
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
