<template>
  <div
    v-bind="rootAttrs"
    ref="treeTableContent"
    :class="{ 'is-resizing': resizing }"
    class="tree-table-content"
  >
    <div v-show="mountTree && iShowTree" ref="treePanel" :style="leftStyle" class="left">
      <span v-if="component === 'AutoDataZTree'" class="title">
        {{ title }}
      </span>
      <component
        v-if="mountTree"
        v-bind="treeTabConfig"
        :is="component"
        :key="componentTreeKey"
        ref="AutoDataZTree"
        :setting="treeSetting"
        class="auto-data-ztree"
        @tree-init-finish="handleTreeInitFinish"
        @url-change="handleUrlChange"
        v-on="forwardedListeners"
      >
        <template #rMenu="slotProps">
          <slot name="rMenu" v-bind="slotProps" />
        </template>
      </component>
    </div>
    <div
      v-if="mountTree"
      ref="treeResizer"
      :class="{ 'is-collapsed': !iShowTree }"
      class="tree-resizer"
      role="separator"
      tabindex="0"
      @keydown.left.prevent="resizeByKeyboard(-16)"
      @keydown.right.prevent="resizeByKeyboard(16)"
    >
      <span
        v-if="iShowTree"
        class="tree-resize-handle"
        @dblclick="fitTreeWidth"
        @pointerdown="startResize"
      />
      <button
        :aria-expanded="iShowTree"
        class="tree-toggle"
        type="button"
        @click.stop="toggleTree"
        @pointerdown.stop
      >
        <el-icon class="tree-toggle__icon" aria-hidden="true">
          <ArrowLeftBold v-if="iShowTree" />
          <ArrowRightBold v-else />
        </el-icon>
      </button>
    </div>
    <div class="right">
      <div class="transition-box">
        <slot name="table">
          <ListTable
            ref="ListTable"
            :header-actions="headerActions"
            :quick-filters="quickFilters"
            :quick-summary="quickSummary"
            :table-config="iTableConfig"
            :create-drawer="createDrawer"
            v-on="forwardedListeners"
          >
            <template v-if="$slots['search-after']" #search-after>
              <slot name="search-after" />
            </template>
          </ListTable>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import ListTable from '@/components/Table/DrawerListTable/index.vue'
import FileTree from '@/components/Table/TreeTable/components/FileTree.vue'
import AutoDataZTree from '@/components/Tree/AutoDataZTree/index.vue'
import { setUrlParam } from '@/utils/common/index'
import { omitVueListeners, pickVueListeners } from '@/utils/vue'
import TabTree from '../TabTree/index.vue'

const DEFAULT_TREE_WIDTH_RATIO = 0.236
const DEFAULT_TREE_MIN_WIDTH = 240
const TREE_MAX_WIDTH = 620
const TABLE_MIN_WIDTH = 480
const TREE_FIT_MIN_WIDTH = 180
const TREE_CONTENT_HORIZONTAL_PADDING = 20
const TREE_CONTENT_COMFORT_GAP = 16
const TREE_HEADER_GAP = 8

function buildInitialTableConfig(tableConfig, routeQuery = {}) {
  const config = { ...tableConfig }
  let url = config.url || ''

  if (!url) {
    return config
  }
  if (routeQuery.asset) {
    url = setUrlParam(url, 'asset', routeQuery.asset)
  }
  if (routeQuery.node) {
    url = setUrlParam(url, 'node', routeQuery.node)
  }

  return { ...config, url }
}

export default {
  name: 'TreeTable',
  components: {
    ListTable,
    AutoDataZTree,
    FileTree,
    TabTree,
    IBox,
    Dialog
  },
  inheritAttrs: false,
  props: {
    ...ListTable.props,
    treeSetting: {
      type: Object,
      default: () => AutoDataZTree.props.setting.default()
    },
    showTree: {
      type: Boolean,
      default: true
    },
    mountTree: {
      type: Boolean,
      default: true
    },
    // 默认引用的Tree组件
    component: {
      type: String,
      default: () => 'AutoDataZTree'
    },
    treeTabConfig: {
      type: Object,
      default: () => ({})
    },
    treeWidth: {
      type: String,
      default: () => '23.6%'
    },
    treeMinWidth: {
      type: Number,
      default: DEFAULT_TREE_MIN_WIDTH
    },
    treeInitialMaxWidth: {
      type: Number,
      default: TREE_MAX_WIDTH
    },
    autoFitTreeWidth: {
      type: Boolean,
      default: false
    },
    quickFilters: {
      type: Array,
      default: null
    },
    quickSummary: {
      type: Array,
      default: null
    },
    headerActions: {
      type: Object,
      default: () => ({})
    },
    title: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: String,
      default() {
        return 'AssetTree'
      }
    }
  },
  data() {
    return {
      // The table must receive its final URL before its children mount. Updating
      // it from mounted() caused AutoDataSearch and AutoDataTable to initialise
      // once with the base URL and once again with empty asset/node parameters.
      iTableConfig: buildInitialTableConfig(this.tableConfig, this.$route.query),
      iShowTree: this.showTree,
      componentTreeKey: 0,
      leftWidth: null,
      resizing: false,
      resizeStartX: 0,
      resizeStartWidth: 0,
      treeFitFrame: null
    }
  },
  computed: {
    leftStyle() {
      return {
        width: this.leftWidth === null ? this.treeWidth : `${this.leftWidth}px`
      }
    },
    rootAttrs() {
      return omitVueListeners(this.$attrs)
    },
    forwardedListeners() {
      return pickVueListeners(this.$attrs)
    }
  },
  watch: {
    treeConfig: {
      handler(val) {},
      deep: true
    },
    iShowTree(val, oldVal) {
      if (val && oldVal === false && this.treeTabConfig.treeComponent !== 'XTree') {
        this.$nextTick(() => {
          this.forceRerenderTree()
        })
      }
    },
    showTree(val) {
      this.iShowTree = val
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initializeTreeWidth()
    })
  },
  beforeUnmount() {
    this.stopResize()
    if (this.treeFitFrame !== null) {
      window.cancelAnimationFrame(this.treeFitFrame)
    }
  },
  methods: {
    getConfiguredTreeWidth(containerWidth) {
      const configuredWidth = String(this.treeWidth).trim()
      const parsedWidth = Number.parseFloat(configuredWidth)
      const width = configuredWidth.endsWith('%')
        ? (containerWidth * parsedWidth) / 100
        : parsedWidth
      return Number.isFinite(width) ? width : containerWidth * DEFAULT_TREE_WIDTH_RATIO
    },
    initializeTreeWidth() {
      const containerWidth = this.$refs.treeTableContent?.clientWidth || 0
      if (!containerWidth) {
        return
      }
      const configuredWidth = Math.min(
        this.getConfiguredTreeWidth(containerWidth),
        this.treeInitialMaxWidth
      )
      this.leftWidth = this.clampTreeWidth(configuredWidth)
    },
    clampTreeWidth(width, minimumWidth = this.treeMinWidth) {
      const containerWidth = this.$refs.treeTableContent?.clientWidth || 0
      const minWidth = Math.min(minimumWidth, containerWidth * 0.4)
      const maxWidth = Math.max(
        minWidth,
        Math.min(TREE_MAX_WIDTH, containerWidth - TABLE_MIN_WIDTH)
      )
      return Math.round(Math.min(Math.max(width, minWidth), maxWidth))
    },
    startResize(event) {
      if (!this.iShowTree || event.button !== 0) {
        return
      }
      this.resizing = true
      this.resizeStartX = event.clientX
      this.resizeStartWidth = this.leftWidth || this.$refs.treePanel?.offsetWidth || 0
      document.addEventListener('pointermove', this.handleResize)
      document.addEventListener('pointerup', this.stopResize)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    handleResize(event) {
      if (!this.resizing) {
        return
      }
      this.leftWidth = this.clampTreeWidth(
        this.resizeStartWidth + event.clientX - this.resizeStartX
      )
    },
    stopResize() {
      if (!this.resizing) {
        return
      }
      this.resizing = false
      document.removeEventListener('pointermove', this.handleResize)
      document.removeEventListener('pointerup', this.stopResize)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    },
    resizeByKeyboard(offset) {
      if (!this.iShowTree) {
        this.iShowTree = true
        return
      }
      this.leftWidth = this.clampTreeWidth((this.leftWidth || 0) + offset)
    },
    fitTreeWidth() {
      const containerWidth = this.$refs.treeTableContent?.clientWidth || 0
      const treePanel = this.$refs.treePanel
      const treeBody = treePanel?.querySelector('.x-tree__body')
      if (!containerWidth) {
        return
      }
      if (!treeBody) {
        this.leftWidth = this.clampTreeWidth(this.getConfiguredTreeWidth(containerWidth))
        return
      }

      const scrollElement =
        treeBody.querySelector('.el-tree-virtual-list, .x-tree__viewport') || treeBody
      const bodyRect = scrollElement.getBoundingClientRect()
      const scrollLeft = scrollElement.scrollLeft || 0
      const contentElements = treeBody.querySelectorAll('.x-tree__node-amount, .x-tree__node-label')
      let contentWidth = 0
      contentElements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        if (!rect.width || !rect.height) {
          return
        }
        contentWidth = Math.max(contentWidth, rect.right - bodyRect.left + scrollLeft)
      })

      const treeViewSelector = treePanel.querySelector('.tree-view-selector')
      const headerActions = treePanel.querySelector(
        '.node-asset-tree__header-actions, .x-tree__header-actions'
      )
      const headerWidth =
        (treeViewSelector?.scrollWidth || 0) + (headerActions?.offsetWidth || 0) + TREE_HEADER_GAP
      const minimumFitWidth = Math.max(this.treeMinWidth, TREE_FIT_MIN_WIDTH, headerWidth)
      const preferredWidth = Math.max(
        minimumFitWidth,
        contentWidth + TREE_CONTENT_HORIZONTAL_PADDING + TREE_CONTENT_COMFORT_GAP
      )
      this.leftWidth = this.clampTreeWidth(preferredWidth, minimumFitWidth)

      this.$nextTick(() => {
        scrollElement.scrollLeft = 0
      })
    },
    handleTreeInitFinish(tree) {
      if (this.autoFitTreeWidth) {
        this.$nextTick(() => {
          if (this.treeFitFrame !== null) {
            window.cancelAnimationFrame(this.treeFitFrame)
          }
          this.treeFitFrame = window.requestAnimationFrame(() => {
            this.treeFitFrame = null
            this.fitTreeWidth()
          })
        })
      }
      this.$emit('tree-init-finish', tree)
    },
    toggleTree() {
      this.iShowTree = !this.iShowTree
    },
    handleUrlChange(url) {
      if (!url || url === this.iTableConfig.url) {
        return
      }
      this.iTableConfig = {
        ...this.iTableConfig,
        url
      }
      this.$emit('urlChange', url)
    },
    forceRerenderTree() {
      this.componentTreeKey += 1
    },
    hideRMenu() {
      return this.$refs.AutoDataZTree?.hideRMenu?.()
    },
    getSelectedNodes: function () {
      return this.$refs.AutoDataZTree?.getSelectedNodes?.() || []
    },
    getNodes: function () {
      return this.$refs.AutoDataZTree?.getNodes?.() || []
    },
    getAllNodes: function () {
      const tree = this.$refs.AutoDataZTree
      return tree?.getAllNodes?.() || tree?.getNodes?.() || []
    },
    getTreeSnapshot: function () {
      return this.$refs.AutoDataZTree?.getTreeSnapshot?.()
    },
    selectNode: function (node) {
      return this.$refs.AutoDataZTree?.selectNode?.(node)
    },
    refreshAssetRelationAmounts(nodeIds) {
      return this.$refs.AutoDataZTree?.refreshAssetRelationAmounts?.(nodeIds)
    },
    reloadVisibleMetrics(options) {
      return this.$refs.AutoDataZTree?.reloadVisibleMetrics?.(options)
    },
    invalidateNormalMetrics() {
      return this.$refs.AutoDataZTree?.invalidateNormalMetrics?.()
    },
    setNodeMetric(id, amount) {
      return this.$refs.AutoDataZTree?.setNodeMetric?.(id, amount)
    },
    setPermissionScope(scope) {
      return this.$refs.AutoDataZTree?.setPermissionScope?.(scope)
    },
    reloadTable() {
      return this.$refs.ListTable?.reloadTable?.()
    },
    toggleRowSelection(row, isSelected) {
      return this.$refs.ListTable?.toggleRowSelection(row, isSelected)
    }
  }
}
</script>

<style lang="scss" scoped>
$origin-color: #ffffff;

.tree-table-content {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  width: 100%;

  &.is-resizing {
    cursor: col-resize;
  }

  .left {
    box-sizing: border-box;
    flex: none;
    min-width: 0;
    border: 1px solid var(--panel-border-color, var(--el-border-color));
    border-radius: var(--el-card-border-radius, 4px);
    overflow: hidden;
    background: $origin-color;
    color: var(--color-border);
    transition: border-color 0.15s ease;

    // title 部分
    .title {
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 20px;
      width: 100%;
      border-bottom: solid 2px var(--color-primary);
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);

      &:hover {
        cursor: pointer;
        color: var(--color-primary);
      }
    }

    .auto-data-ztree {
      overflow: auto;
      height: 100%;

      &.tree-tab {
        overflow: hidden;

        :deep(.tree-view-header) {
          height: var(--tree-table-header-height, 37px);
        }
      }
    }

    // tree 部分
    .data-z-tree {
      //margin-left: -20px;
      //width: calc(100% + 20px);

      .treebox {
        padding-left: 10px;
        padding-bottom: 10px;
      }
    }

    :deep(.tab-text) {
      font-size: 13px;
    }
  }
}

.tree-resizer {
  position: relative;
  z-index: 5;
  flex: 0 0 14px;
  width: 14px;
  background: transparent;

  &.is-collapsed {
    flex-basis: 0;
    width: 0;
    cursor: default;

    .tree-toggle {
      border-left: 1px solid var(--panel-border-color, var(--el-border-color));
      transform: translate(-20px, -50%);
    }
  }
}

.tree-resize-handle {
  position: absolute;
  z-index: 1;
  top: 0;
  bottom: 0;
  left: -6px;
  width: 11px;
  cursor: col-resize;
}

.tree-table-content:has(.tree-resize-handle:hover) .left,
.tree-table-content.is-resizing .left {
  border-right-color: var(--el-color-primary-light-5);
}

.el-tree {
  background-color: inherit !important;
}

.tree-toggle {
  position: absolute;
  top: 40%;
  left: 0;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 34px;
  padding: 0;
  border: 1px solid var(--panel-border-color, var(--el-border-color));
  border-left: 0;
  border-radius: 0 6px 6px 0;
  color: var(--el-text-color-secondary);
  background: var(--el-bg-color);
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.15s ease,
    color 0.15s ease,
    background-color 0.15s ease;

  &::before {
    position: absolute;
    inset: -10px -3px;
    content: '';
  }

  .tree-toggle__icon {
    font-size: 11px;
  }

  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}

.tree-table-content:hover .tree-toggle,
.tree-toggle:focus-visible,
.tree-resizer.is-collapsed .tree-toggle {
  opacity: 1;
}

.right {
  display: flex;
  flex: 1;
  min-width: 0;
}

.transition-box {
  width: 100%;
  min-width: 0;
}

.transition-box.left {
  background: var(--page-background-color, #fff);
  border: 1px solid var(--panel-border-color, var(--el-border-color));
  border-radius: 2px;
}

@media screen and (max-width: 767px) {
  .tree-table-content {
    flex-direction: column;
  }

  .tree-table-content .left {
    position: static;
    width: 100% !important;
    min-height: 120px;
    max-height: 240px;
  }

  .tree-resizer,
  .tree-resizer.is-collapsed {
    position: static;
    flex: 0 0 0;
    width: 100%;
    height: 0 !important;
  }

  .tree-resize-handle {
    display: none;
  }

  .tree-toggle,
  .tree-resizer.is-collapsed .tree-toggle {
    top: 0;
    right: 10px;
    left: auto;
    transform: translateY(-50%) rotate(90deg);
    opacity: 1;
  }

  .right,
  .transition-box {
    min-height: 0;
    width: 100%;
  }
}
</style>
