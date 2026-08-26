<template>
  <el-collapse-transition>
    <div
      v-bind="rootAttrs"
      ref="treeTableContent"
      :class="{ 'is-resizing': resizing }"
      class="tree-table-content"
    >
      <div v-show="iShowTree" :style="leftStyle" class="left">
        <span v-if="component === 'AutoDataZTree'" class="title">
          {{ title }}
        </span>
        <component
          v-bind="treeTabConfig"
          :is="component"
          :key="componentTreeKey"
          ref="AutoDataZTree"
          :setting="treeSetting"
          class="auto-data-ztree"
          @url-change="handleUrlChange"
          v-on="forwardedListeners"
        >
          <template #rMenu="{ data }">
            <slot :data="data" name="rMenu" />
          </template>
        </component>
      </div>
      <div
        :class="{ 'is-collapsed': !iShowTree }"
        class="tree-resizer"
        role="separator"
        tabindex="0"
        @dblclick="resetTreeWidth"
        @keydown.left.prevent="resizeByKeyboard(-16)"
        @keydown.right.prevent="resizeByKeyboard(16)"
        @pointerdown="startResize"
      >
        <button
          :aria-expanded="iShowTree"
          class="tree-toggle"
          type="button"
          @click.stop="toggleTree"
          @pointerdown.stop
        >
          <svg-icon
            :style="{ transform: iShowTree ? 'none' : 'rotate(180deg)' }"
            class="icon-left"
            icon-class="double-left"
          />
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
            />
          </slot>
        </div>
      </div>
    </div>
  </el-collapse-transition>
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
      resizeStartWidth: 0
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
    this.$nextTick(this.initializeTreeWidth)
  },
  beforeUnmount() {
    this.stopResize()
  },
  methods: {
    initializeTreeWidth() {
      const containerWidth = this.$refs.treeTableContent?.clientWidth || 0
      if (!containerWidth) {
        return
      }
      const configuredWidth = String(this.treeWidth).trim()
      const parsedWidth = Number.parseFloat(configuredWidth)
      const width = configuredWidth.endsWith('%')
        ? (containerWidth * parsedWidth) / 100
        : parsedWidth
      this.leftWidth = this.clampTreeWidth(Number.isFinite(width) ? width : containerWidth * 0.236)
    },
    clampTreeWidth(width) {
      const containerWidth = this.$refs.treeTableContent?.clientWidth || 0
      const minWidth = Math.min(240, containerWidth * 0.4)
      const maxWidth = Math.max(minWidth, Math.min(620, containerWidth - 480))
      return Math.round(Math.min(Math.max(width, minWidth), maxWidth))
    },
    startResize(event) {
      if (!this.iShowTree || event.button !== 0) {
        return
      }
      this.resizing = true
      this.resizeStartX = event.clientX
      this.resizeStartWidth =
        this.leftWidth || event.currentTarget.previousElementSibling.offsetWidth
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
    resetTreeWidth() {
      const containerWidth = this.$refs.treeTableContent?.clientWidth || 0
      this.leftWidth = this.clampTreeWidth(containerWidth * 0.236)
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
      this.$refs.AutoDataZTree.hideRMenu()
    },
    getSelectedNodes: function () {
      return this.$refs.AutoDataZTree.getSelectedNodes()
    },
    getNodes: function () {
      return this.$refs.AutoDataZTree.getNodes()
    },
    selectNode: function (node) {
      return this.$refs.AutoDataZTree.selectNode(node)
    },
    refreshAssetRelationAmounts(nodeIds) {
      return this.$refs.AutoDataZTree?.refreshAssetRelationAmounts?.(nodeIds)
    },
    reloadTable() {
      this.$refs.ListTable.reloadTable()
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
    border-right: 1px solid var(--el-border-color-lighter);
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

      &.tree-tab :deep(.page-submenu) {
        height: 40px;
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
  flex: 0 0 8px;
  width: 8px;
  cursor: col-resize;
  background: transparent;

  &.is-collapsed {
    cursor: default;
  }
}

.tree-table-content:has(.tree-resizer:hover) .left,
.tree-table-content.is-resizing .left {
  border-right-color: var(--el-color-primary-light-5);
}

.el-tree {
  background-color: inherit !important;
}

.tree-toggle {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 34px;
  padding: 0;
  border: 1px solid var(--el-border-color);
  border-radius: 3px;
  color: var(--el-text-color-secondary);
  background: var(--el-bg-color);
  cursor: pointer;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition:
    opacity 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;

  .icon-left {
    font-size: 11px;
  }

  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
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
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
}
</style>
