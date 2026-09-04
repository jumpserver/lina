<template>
  <div :class="rootClass" :style="$attrs.style">
    <ResourceSelectSummary
      :count-text="summaryCountText"
      :disabled="isDisabled"
      :has-more="summaryHasMore"
      :items="selectedSummaryItems"
      :selected-count="selectedValue.length"
      :text="summaryText"
      @clear="clearSummaryResources"
      @click="openDialog"
      @load-more="loadNextSummaryBatch"
      @remove="removeSummaryResource"
    />

    <Dialog
      v-if="dialogVisible"
      v-model:visible="dialogVisible"
      :close-on-click-modal="false"
      :title="dialogTitle"
      class="node-select-dialog"
      max-width="440px"
      top="4vh"
      width="440px"
      @cancel="handleCancel"
      @confirm="handleConfirm"
    >
      <div class="node-select-dialog__content">
        <TreePanel
          ref="nodeTree"
          fill-height
          :setting="treeSetting"
          :show-header="false"
          class="node-select-dialog__tree-panel"
          @selected="toggleNode"
          @tree-init-finish="handleTreeReady"
        >
          <template #toolbar-prepend="{ collapseDisabled }">
            <el-button
              :aria-label="$t('TreeActionShowSelectedOnly')"
              :class="{ 'is-active': showSelectedOnly }"
              :disabled="draftValue.length === 0 || !treeReady"
              :title="$t('TreeActionShowSelectedOnly')"
              class="x-tree__tool-button"
              @click="toggleSelectedOnly"
            >
              <el-icon class="x-tree__tool-icon"><View /></el-icon>
            </el-button>
            <el-button
              :aria-label="$t('TreeActionCollapse')"
              :disabled="collapseDisabled"
              :title="$t('TreeActionCollapse')"
              class="x-tree__tool-button"
              @click="collapseTree"
            >
              <svg-icon class="x-tree__tool-icon" icon-class="tree-collapse-all" />
            </el-button>
          </template>
          <template #tools-menu="{ close }">
            <li class="x-tree-tools__divider" />
            <el-dropdown-item
              :disabled="draftValue.length === 0"
              @click="clearSelectedNodes(close)"
            >
              <span class="x-tree-tools__icon"
                ><el-icon><CircleClose /></el-icon
              ></span>
              <span>{{ $t('TreeActionClearSelected') }}</span>
            </el-dropdown-item>
          </template>
          <template #node-actions="{ data }">
            <span class="node-select-dialog__checkbox" @click.stop @pointerdown.stop>
              <el-checkbox
                :aria-label="getNodeLabel(data)"
                :model-value="isNodeSelected(data)"
                @change="setNodeSelected(data, $event)"
              />
            </span>
          </template>
        </TreePanel>
      </div>

      <template #footer>
        <span class="node-select-dialog__selected-count">{{ draftSelectionText }}</span>
        <div class="node-select-dialog__footer-actions">
          <el-button @click="handleCancel">{{ $t('Cancel') }}</el-button>
          <el-button type="primary" @click="handleConfirm">{{ $t('Confirm') }}</el-button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import TreePanel from '@/components/Tree/TreePanel/index.vue'
import {
  createXTreeSetting,
  X_TREE_LOAD_MODES,
  X_TREE_SEARCH_PLACEMENTS
} from '@/components/Tree/XTree/config'
import ResourceSelectSummary from '../ResourceSelectSummary.vue'
import resourceSelectSummary, { normalizeResourceValue } from '../resourceSelectSummary'

function hasValue(value) {
  return value !== undefined && value !== null && value !== ''
}

export default {
  name: 'NodeSelect',
  components: { Dialog, ResourceSelectSummary, TreePanel },
  mixins: [resourceSelectSummary],
  inheritAttrs: false,
  props: {
    value: {
      type: [Array, String, Number, Object],
      default: undefined
    },
    modelValue: {
      type: [Array, String, Number, Object],
      default: undefined
    },
    url: {
      type: String,
      default: '/api/v1/assets/nodes/'
    },
    treeUrl: {
      type: String,
      default: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all'
    },
    resourceName: {
      type: String,
      default: ''
    },
    valueKey: {
      type: String,
      default: 'id'
    },
    queryParams: {
      type: [Object, Function],
      default: () => ({})
    },
    disabled: {
      type: [Boolean, Function],
      default: false
    }
  },
  emits: ['input', 'change', 'update:modelValue', 'update:model-value'],
  data() {
    return {
      dialogVisible: false,
      draftValue: [],
      treeReady: false,
      showSelectedOnly: false,
      selectedValue: normalizeResourceValue(
        this.modelValue !== undefined ? this.modelValue : this.value,
        this.valueKey
      )
    }
  },
  computed: {
    externalValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    isDisabled() {
      return typeof this.disabled === 'function' ? this.disabled() : this.disabled
    },
    resourceUrl() {
      return this.url
    },
    displayResourceName() {
      return this.resourceName || this.$t('Nodes')
    },
    dialogTitle() {
      return this.$t('ResourceSelectDialogTitle', { resource: this.displayResourceName })
    },
    draftSelectionText() {
      return this.$t('ResourceSelectSelectedCount', {
        count: this.draftValue.length,
        resource: this.displayResourceName
      })
    },
    draftValueKeys() {
      return new Set(this.draftValue.map((item) => String(item)))
    },
    nodeUrl() {
      return this.url.replace(/\?.*$/, '').replace(/\/?$/, '/')
    },
    resourceTreeUrl() {
      return this.appendQueryParams(this.treeUrl, this.getQueryParams())
    },
    treeSetting() {
      return createXTreeSetting({
        amountTypes: ['node'],
        countUrl: '/api/v1/assets/nodes/assets-amount/',
        edit: { drag: { isMove: false } },
        hasRightMenu: true,
        loadMode: X_TREE_LOAD_MODES.EAGER,
        nodeUrl: this.nodeUrl,
        readOnly: false,
        showAssets: false,
        showAssetScope: true,
        showCollapse: false,
        showCreate: true,
        showDefaultMenu: true,
        showDelete: false,
        showMenu: () => this.$hasPerm('assets.add_node'),
        showRefresh: true,
        showSearch: true,
        searchPlacement: X_TREE_SEARCH_PLACEMENTS.HEADER,
        showUpdate: false,
        structureUrl: this.resourceTreeUrl,
        treeUrl: this.resourceTreeUrl,
        toolsPlacement: 'bottom-start',
        virtualize: true
      })
    },
    rootClass() {
      return ['node-select', this.$attrs.class]
    }
  },
  watch: {
    externalValue: {
      deep: true,
      handler(value) {
        this.syncSelectedValue(value)
      }
    },
    draftValue: {
      handler(value) {
        if (value.length > 0 || !this.showSelectedOnly) {
          return
        }
        this.showSelectedOnly = false
        this.$nextTick(() => this.$refs.nodeTree?.restoreAllNodes())
      }
    }
  },
  methods: {
    getQueryParams() {
      const params = typeof this.queryParams === 'function' ? this.queryParams() : this.queryParams
      return params || {}
    },
    appendQueryParams(url, queryParams) {
      const [path, query = ''] = url.split('?')
      const params = new URLSearchParams(query)
      Object.entries(queryParams).forEach(([key, value]) => {
        params.delete(key)
        const values = Array.isArray(value) ? value : [value]
        values.forEach((item) => {
          if (hasValue(item)) {
            params.append(key, item)
          }
        })
      })
      const search = params.toString()
      return search ? `${path}?${search}` : path
    },
    getNodeId(node) {
      return (
        node?.resourceId ??
        node?.meta?.data?.[this.valueKey] ??
        node?.nodeId ??
        node?.[this.valueKey] ??
        node?.id
      )
    },
    getNodeLabel(node) {
      return (
        node?.name ||
        node?.full_value ||
        node?.meta?.data?.full_value ||
        node?.meta?.data?.value ||
        ''
      )
    },
    isNodeSelected(node) {
      const id = this.getNodeId(node)
      return hasValue(id) && this.draftValueKeys.has(String(id))
    },
    cacheNode(node) {
      const id = this.getNodeId(node)
      const name = String(this.getNodeLabel(node) || '').trim()
      if (hasValue(id) && name) {
        this.summaryResourceCache.set(String(id), { value: id, name })
      }
    },
    setNodeSelected(node, selected) {
      const id = this.getNodeId(node)
      if (!hasValue(id)) {
        return
      }
      this.cacheNode(node)
      const key = String(id)
      const isSelected = this.draftValueKeys.has(key)
      if (Boolean(selected) === isSelected) {
        return
      }
      const payload = selected
        ? [...this.draftValue, id]
        : this.draftValue.filter((item) => String(item) !== key)
      this.draftValue = payload
      if (this.showSelectedOnly && payload.length > 0) {
        this.syncSelectedOnlyTree()
      }
    },
    toggleNode(node) {
      this.setNodeSelected(node, !this.isNodeSelected(node))
    },
    openDialog() {
      if (this.isDisabled || !this.resourceTreeUrl) {
        return
      }
      this.draftValue = [...this.selectedValue]
      this.treeReady = false
      this.showSelectedOnly = false
      this.dialogVisible = true
    },
    handleTreeReady() {
      this.treeReady = true
      this.syncSelectedOnlyTree()
    },
    syncSelectedOnlyTree() {
      const tree = this.$refs.nodeTree
      if (!tree || !this.treeReady) {
        return
      }
      if (this.showSelectedOnly) {
        return tree.showOnlyNodes(this.draftValue)
      }
    },
    toggleSelectedOnly() {
      if (this.draftValue.length === 0) {
        return
      }
      this.showSelectedOnly = !this.showSelectedOnly
      this.$nextTick(() => {
        if (!this.treeReady) {
          return
        }
        if (this.showSelectedOnly) {
          this.syncSelectedOnlyTree()
        } else {
          this.$refs.nodeTree?.restoreAllNodes()
        }
      })
    },
    collapseTree() {
      if (!this.treeReady) {
        return
      }
      this.$refs.nodeTree?.collapseStepwise()
    },
    clearSelectedNodes(close) {
      close?.()
      this.draftValue = []
      if (this.showSelectedOnly) {
        this.showSelectedOnly = false
        this.$nextTick(() => this.$refs.nodeTree?.restoreAllNodes())
      }
    },
    handleConfirm() {
      this.updateSelectedValue(this.draftValue)
      this.dialogVisible = false
    },
    handleCancel() {
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.node-select {
  width: 100%;
  min-width: 0;
}
</style>

<style lang="scss">
.node-select-dialog.el-dialog {
  --node-select-dialog-max-height: min(560px, 82vh);
  --node-select-dialog-content-inline-padding: 16px;

  display: flex;
  flex-direction: column;
  height: var(--node-select-dialog-max-height);
  max-height: var(--node-select-dialog-max-height);

  .el-dialog__header,
  .el-dialog__footer {
    flex: none;
  }

  .el-dialog__body {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    padding: 0 !important;
    overflow: hidden;
    background: var(--el-bg-color, #fff);
  }

  .el-dialog__body > div {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
  }

  .node-select-dialog__content {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  .node-select-dialog__tree-panel {
    --x-tree-toolbar-height: 50px;
    --x-tree-toolbar-padding-block: 10px;
    --x-tree-toolbar-padding-inline: var(--node-select-dialog-content-inline-padding);
    --x-tree-body-inline-padding: var(--node-select-dialog-content-inline-padding);
    --x-tree-body-border-top: 0;
    --x-tree-body-separator-space-before: 0;
    --x-tree-body-separator-space-after: 0;

    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
  }

  .node-select-dialog__checkbox {
    order: -1;
    display: inline-flex;
    flex: none;
    align-items: center;
    align-self: stretch;
    padding-left: 2px;
  }

  .node-select-dialog__checkbox .el-checkbox {
    height: 100%;
    margin-right: 2px;
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .node-select-dialog__selected-count {
    flex: none;
    margin-right: auto;
    color: var(--el-text-color-secondary);
    font-size: 13px;
    text-align: left;
  }

  .node-select-dialog__footer-actions {
    display: flex;
    align-items: center;
    gap: 12px;

    .el-button + .el-button {
      margin-left: 0;
    }
  }
}
</style>
