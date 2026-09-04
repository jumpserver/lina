<template>
  <div :class="rootClass" :style="$attrs.style">
    <el-popover
      :visible="pickerVisible"
      :disabled="isDisabled || !resourceTreeUrl"
      :hide-after="0"
      :persistent="true"
      :popper-style="{ zIndex: pickerZIndex }"
      :popper-options="{
        modifiers: [{ name: 'computeStyles', options: { gpuAcceleration: false } }]
      }"
      :show-arrow="false"
      :width="320"
      placement="bottom-start"
      popper-class="node-select-popper"
      transition="node-select-instant"
      trigger="click"
      @before-enter="prepareSelection"
      @update:visible="handlePickerVisibilityChange"
    >
      <template #reference>
        <ResourceSelectSummary
          :count-text="summaryCountText"
          :disabled="isDisabled"
          :has-more="summaryHasMore"
          :items="selectedSummaryItems"
          :selected-count="selectedValue.length"
          :text="summaryText"
          @clear="clearSummaryResources"
          @load-more="loadNextSummaryBatch"
          @remove="removeSummaryResource"
        />
      </template>

      <div class="node-select-popup">
        <div class="node-select-popup__tree">
          <div class="node-select-popup__header">
            <i aria-hidden="true" class="fa-solid fa-tree node-select-popup__header-icon" />
            <span class="node-select-popup__header-title">{{ $t('NodeTree') }}</span>
          </div>
          <XTree
            v-if="treeMounted"
            ref="nodeTree"
            :setting="treeSetting"
            @selected="toggleNode"
            @tree-init-finish="handleTreeReady"
          >
            <template #tools-menu="{ close }">
              <li class="x-tree-tools__divider" />
              <el-dropdown-item
                :class="{ 'is-active': showSelectedOnly }"
                :disabled="selectedValue.length === 0"
                @click="toggleSelectedOnly(close)"
              >
                <span class="x-tree-tools__icon"
                  ><el-icon><View /></el-icon
                ></span>
                <span>{{ $t('TreeActionShowSelectedOnly') }}</span>
              </el-dropdown-item>
              <el-dropdown-item
                :disabled="selectedValue.length === 0"
                @click="clearSelectedNodes(close)"
              >
                <span class="x-tree-tools__icon"
                  ><el-icon><CircleClose /></el-icon
                ></span>
                <span>{{ $t('TreeActionClearSelected') }}</span>
              </el-dropdown-item>
            </template>
            <template #node-actions="{ data }">
              <span class="node-select-popup__checkbox" @click.stop @pointerdown.stop>
                <el-checkbox
                  :aria-label="getNodeLabel(data)"
                  :model-value="isNodeSelected(data)"
                  @change="setNodeSelected(data, $event)"
                />
              </span>
            </template>
          </XTree>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
import { useZIndex } from 'element-plus'
import XTree from '@/components/Tree/XTree/index.vue'
import ResourceSelectSummary from '../ResourceSelectSummary.vue'
import resourceSelectSummary, { normalizeResourceValue } from '../resourceSelectSummary'

export default {
  name: 'NodeSelect',
  components: { ResourceSelectSummary, XTree },
  mixins: [resourceSelectSummary],
  inheritAttrs: false,
  setup() {
    const { nextZIndex } = useZIndex()
    return { nextZIndex }
  },
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
      pickerVisible: false,
      pickerZIndex: undefined,
      treeMounted: false,
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
    nodeUrl() {
      return this.url.replace(/\?.*$/, '').replace(/\/?$/, '/')
    },
    resourceTreeUrl() {
      return this.appendQueryParams(this.treeUrl, this.getQueryParams())
    },
    treeSetting() {
      return {
        amountTypes: ['node'],
        countUrl: '/api/v1/assets/nodes/assets-amount/',
        edit: { drag: { isMove: false } },
        hasRightMenu: true,
        lazyLoad: false,
        nodeUrl: this.nodeUrl,
        readOnly: false,
        showAssets: false,
        showAssetScope: true,
        showCollapse: true,
        showCreate: true,
        showDefaultMenu: true,
        showDelete: false,
        showMenu: () => this.$hasPerm('assets.add_node'),
        showRefresh: true,
        showSearch: true,
        showUpdate: false,
        structureUrl: this.resourceTreeUrl,
        treeUrl: this.resourceTreeUrl,
        toolsPlacement: 'bottom-start',
        toolsTeleported: false,
        virtualize: true
      }
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
    selectedValue: {
      deep: true,
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
          if (item !== undefined && item !== null && item !== '') {
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
      return this.selectedValue.some((item) => String(item) === String(id))
    },
    cacheNode(node) {
      const id = this.getNodeId(node)
      const name = String(this.getNodeLabel(node) || '').trim()
      if (id !== undefined && id !== null && id !== '' && name) {
        this.summaryResourceCache.set(String(id), { value: id, name })
      }
    },
    setNodeSelected(node, selected) {
      const id = this.getNodeId(node)
      if (id === undefined || id === null || id === '') {
        return
      }
      this.cacheNode(node)
      let payload = this.selectedValue
      if (selected && !this.isNodeSelected(node)) {
        payload = [...this.selectedValue, id]
      } else if (!selected) {
        payload = this.selectedValue.filter((item) => String(item) !== String(id))
      }
      this.updateSelectedValue(payload)
      if (this.showSelectedOnly && payload.length > 0) {
        this.syncSelectedOnlyTree()
      }
    },
    toggleNode(node) {
      this.setNodeSelected(node, !this.isNodeSelected(node))
    },
    prepareSelection() {
      this.treeMounted = true
      this.$nextTick(() => this.syncSelectedOnlyTree())
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
        return tree.showOnlyNodes(this.selectedValue)
      }
    },
    toggleSelectedOnly(close) {
      if (this.selectedValue.length === 0) {
        return
      }
      close?.()
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
    clearSelectedNodes(close) {
      close?.()
      this.updateSelectedValue([])
      if (this.showSelectedOnly) {
        this.showSelectedOnly = false
        this.$nextTick(() => this.$refs.nodeTree?.restoreAllNodes())
      }
    },
    handlePickerVisibilityChange(visible) {
      if (visible) {
        this.pickerZIndex = Math.max(this.nextZIndex(), 4001)
      }
      this.pickerVisible = visible
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
.node-select-popper.el-popper {
  box-sizing: border-box;
  padding: 0;
  overflow: visible;
  border-radius: 2px;
}

.node-select-popup {
  --node-select-header-background: var(--el-fill-color-lighter, #fafafa);

  display: flex;
  flex-direction: column;
  width: 100%;
  height: 480px;

  .node-select-popup__tree {
    position: relative;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    overflow: visible;
  }

  .node-select-popup__header {
    display: flex;
    flex: none;
    align-items: center;
    height: 40px;
    padding: 0 80px 0 18px;
    background: var(--node-select-header-background);
  }

  .node-select-popup__header-icon {
    flex: none;
    width: 14px;
    margin-right: 6px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    text-align: center;
  }

  .node-select-popup__header-title {
    overflow: hidden;
    color: var(--el-text-color-primary);
    font-size: 13px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .node-select-popup__tree > .x-tree {
    flex: 1 1 auto;
    height: auto;
    min-height: 0;
  }

  .node-select-popup__tree .x-tree__search-row,
  .node-select-popup__tree .x-tree__search {
    background-color: var(--node-select-header-background);
  }

  .node-select-popup__checkbox {
    order: -1;
    display: inline-flex;
    flex: none;
    align-items: center;
    align-self: stretch;
    padding-left: 2px;
  }

  .node-select-popup__checkbox .el-checkbox {
    height: 100%;
    margin-right: 2px;
  }
}
</style>
