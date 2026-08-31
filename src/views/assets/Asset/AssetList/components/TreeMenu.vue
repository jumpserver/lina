<template>
  <div>
    <li id="m_show_node_info" class="rmenu" tabindex="-1" @click="rMenuShowNodeInfo">
      <i class="fa fa-info-circle" /> {{ $t('ShowNodeInfo') }}
    </li>
    <li class="divider" />
    <li
      id="m_add_asset_to_node"
      v-if="$hasPerm('assets.change_assetnodes')"
      class="rmenu"
      tabindex="-1"
      @click="rMenuAddAssetToNode"
    >
      <i class="fa fa-clone" /> {{ $t('AddAssetToNode') }}
    </li>
    <li
      id="m_move_asset_to_node"
      v-if="$hasPerm('assets.change_assetnodes')"
      class="rmenu"
      tabindex="-1"
      @click="rMenuMoveAssetToNode"
    >
      <i class="fa fa-scissors" /> {{ $t('MoveAssetToNode') }}
    </li>
    <li
      id="m_remove_asset_from_node"
      v-if="$hasPerm('assets.change_assetnodes')"
      class="rmenu"
      tabindex="-1"
      @click="rMenuRemoveAssetFromNode"
    >
      <i class="fa fa-minus-square-o" /> {{ $t('RemoveAssetFromNode') }}
    </li>
    <li v-if="$hasPerm('assets.change_assetnodes')" class="divider" />
    <li
      id="m_update_node_asset_hardware_info"
      v-if="$hasPerm('assets.refresh_assethardwareinfo')"
      class="rmenu tree-menu__external-item"
      tabindex="-1"
      @click="rMenuUpdateNodeAssetHardwareInfo"
    >
      <i class="fa fa-refresh" />
      <span class="tree-menu__label">{{ $t('UpdateNodeAssetHardwareInfo') }}</span>
      <i class="fa fa-external-link tree-menu__external-icon" />
    </li>
    <li
      id="m_test_node_asset_connectivity"
      v-if="$hasPerm('assets.test_assetconnectivity')"
      class="rmenu tree-menu__external-item"
      tabindex="-1"
      @click="rMenuTestNodeAssetConnectivity"
    >
      <i class="fa fa-link" />
      <span class="tree-menu__label">{{ $t('TestNodeAssetConnectivity') }}</span>
      <i class="fa fa-external-link tree-menu__external-icon" />
    </li>
    <NodeAssetsUpdateDialog
      v-bind="nodeAssetsUpdateDialog"
      v-if="nodeAssetsUpdateDialog.visible"
      :tree="tree"
      v-model:visible="nodeAssetsUpdateDialog.visible"
      @hide-menu="hideMenu"
    />
    <Dialog
      v-model:visible="nodeInfoDialogSetting.dialogVisible"
      align-center
      class="node-info-dialog"
      destroy-on-close
      :show-cancel="false"
      :show-confirm="false"
      :title="$tc('NodeInformation')"
      width="640px"
    >
      <div class="node-info-dialog__details">
        <div
          v-for="item in nodeInfoDialogSetting.items"
          :key="item.key"
          class="node-info-dialog__row"
        >
          <div class="node-info-dialog__label">
            {{ item.label }}
          </div>
          <div
            :class="{ 'is-code': item.code }"
            :title="String(item.value || '-')"
            class="node-info-dialog__value"
          >
            {{ item.value || '-' }}
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import { openTaskPage } from '@/utils/jms/index'
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
    rMenuRemoveAssetFromNode() {
      this.nodeAssetsUpdateDialog.visible = true
      this.nodeAssetsUpdateDialog.action = 'remove'
      this.nodeAssetsUpdateDialog.selectNode = this.getSelectedNodes()[0]
    },
    rMenuUpdateNodeAssetHardwareInfo() {
      this.hideMenu()
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$axios
        .post(`/api/v1/assets/nodes/${currentNode.meta.data.id}/tasks/`, { action: 'refresh' })
        .then((res) => {
          openTaskPage(res['task'])
        })
        .catch((error) => {
          this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + error))
        })
    },
    rMenuTestNodeAssetConnectivity() {
      this.hideMenu()
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) {
        return
      }
      this.$axios
        .post(`/api/v1/assets/nodes/${currentNode.meta.data.id}/tasks/`, { action: 'test' })
        .then((res) => {
          openTaskPage(res['task'])
        })
        .catch((error) => {
          this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + error))
        })
    },
    async rMenuShowNodeInfo() {
      const currentNode = this.getSelectedNodes()[0]
      if (!currentNode) return

      this.hideMenu()
      try {
        const res = await this.$axios.get(`/api/v1/assets/nodes/${currentNode.meta.data.id}/`)
        this.nodeInfoDialogSetting.dialogVisible = true
        this.nodeInfoDialogSetting.items = [
          { key: 'id', label: 'ID', value: res.id, code: true },
          { key: 'key', label: 'KEY', value: res.key, code: true },
          { key: 'name', label: this.$t('Name'), value: res.name },
          { key: 'fullName', label: this.$t('FullName'), value: res.full_value }
        ]
      } catch (error) {
        this.$message.error(this.$tc('ErrorMsg' + ' ' + error))
      }
    },
    hideMenu() {
      this.tree.hideRMenu()
    },
    getSelectedNodes() {
      return this.tree.getSelectedNodes()
    }
  }
}
</script>

<style lang="scss">
.x-tree-context-menu {
  .rmenu > i.fa:not(.tree-menu__external-icon) {
    width: 16px;
  }

  .tree-menu__label {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rmenu > .tree-menu__external-icon {
    display: inline-flex;
    width: 9px;
    visibility: hidden;
    color: var(--el-text-color-placeholder);
    font-size: 9px;
    line-height: 1;
  }

  .tree-menu__external-item:hover > .tree-menu__external-icon,
  .tree-menu__external-item:focus-visible > .tree-menu__external-icon {
    visibility: visible;
  }
}

.node-info-dialog.dialog {
  border-radius: 8px;

  .el-dialog__body {
    padding: 24px !important;
  }

  .node-info-dialog__details {
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
  }

  .node-info-dialog__row {
    display: grid;
    grid-template-columns: 112px minmax(0, 1fr);
    min-height: 50px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: 0;
    }
  }

  .node-info-dialog__label,
  .node-info-dialog__value {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 12px 16px;
  }

  .node-info-dialog__label {
    color: var(--el-text-color-secondary);
    font-weight: 500;
    background: var(--el-fill-color-lighter);
    border-right: 1px solid var(--el-border-color-lighter);
  }

  .node-info-dialog__value {
    min-width: 0;
    color: var(--el-text-color-primary);
    line-height: 22px;
    overflow-wrap: anywhere;

    &.is-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
    }
  }
}

@media (max-width: 600px) {
  .node-info-dialog.dialog {
    .el-dialog__body {
      padding: 18px !important;
    }

    .node-info-dialog__row {
      display: block;
    }

    .node-info-dialog__label {
      padding: 9px 12px;
      border-right: 0;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .node-info-dialog__value {
      min-height: 42px;
      padding: 10px 12px;
    }
  }
}
</style>
