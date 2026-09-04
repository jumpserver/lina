<template>
  <span class="node-search">
    <el-popover
      v-model:visible="popoverVisible"
      :hide-after="0"
      :popper-options="popoverOptions"
      :popper-style="popoverStyle"
      :popper-class="popoverClass"
      :width="width"
      placement="bottom-start"
      trigger="click"
      transition="node-search-popover"
      @after-enter="handlePopoverAfterEnter"
      @after-leave="handlePopoverAfterLeave"
    >
      <template #reference>
        <el-button
          ref="triggerButton"
          :aria-label="buttonTitle"
          :class="{ 'is-active': selectedNode !== null }"
          :title="buttonTitle"
          class="node-search__button"
          size="small"
        >
          <svg-icon icon-class="tree" />
          <span v-if="selectedNode" class="node-search__indicator" />
        </el-button>
      </template>

      <div class="node-search-panel" @click.stop @mousedown.stop @pointerdown.stop>
        <div class="node-search-panel__header">
          <span :title="selectedNodeLabel" class="node-search-panel__title">
            {{ selectedNodeLabel || $t('NodeFilterAll') }}
          </span>
        </div>

        <TabTree
          v-model:active-menu="activeTree"
          ref="nodeTree"
          :submenu="treeViews"
          fill-height
          :view-menu-teleported="false"
          class="node-search-panel__tree-switcher"
          @active-tree-ready="handleActiveTreeReady"
          @selected="handleTreeSelected(activeTree, $event)"
          @tab-click="handleTreeTabClick"
          @tree-init-finish="handleTreeReady(activeTree)"
        >
          <template #tools-menu="{ close }">
            <NodeSearchTreeMenu
              :clear-disabled="!selectedNode"
              :collapse-disabled="isTreeActionDisabled(activeTree)"
              @clear="clearSelection(close)"
              @collapse="collapseTree(activeTree, close)"
            />
          </template>
          <template #node-actions="{ data }">
            <span class="node-search-panel__checkbox" @click.stop @pointerdown.stop>
              <el-checkbox
                :aria-label="getNodeLabel(data)"
                :model-value="isTreeNodeSelected(activeTree, data)"
                @change="setTreeNodeSelected(activeTree, data, $event)"
              />
            </span>
          </template>
        </TabTree>
      </div>
    </el-popover>

    <el-tooltip
      :content="buttonTitle"
      :disabled="popoverVisible || !triggerElement"
      :show-after="200"
      :virtual-ref="triggerElement"
      placement="top"
      popper-class="node-search-tooltip"
      virtual-triggering
    />
  </span>
</template>

<script>
import TabTree from '@/components/Table/TabTree/index.vue'
import {
  createXTreeDataSource,
  createXTreeSetting,
  X_TREE_LOAD_MODES
} from '@/components/Tree/XTree/config'
import NodeSearchTreeMenu from './NodeSearchTreeMenu.vue'

export default {
  name: 'NodeSearch',
  components: { NodeSearchTreeMenu, TabTree },
  props: {
    treeUrl: {
      type: String,
      required: true
    },
    typeTreeUrl: {
      type: String,
      required: true
    },
    queryParams: {
      type: [Object, Function],
      default: () => ({})
    },
    queryKey: {
      type: String,
      default: 'node_id'
    },
    includeDescendants: {
      type: Boolean,
      default: true
    },
    treeAmountUrl: {
      type: [String, Function],
      default: '/api/v1/assets/nodes/assets-amount/'
    },
    treeAmountLoader: {
      type: Function,
      default: null
    },
    treeAmountTypes: {
      type: Array,
      default: () => ['node']
    },
    width: {
      type: Number,
      default: 320
    },
    sharedTreeState: {
      type: Object,
      default: null
    }
  },
  emits: ['nodeSearch'],
  data() {
    return {
      activeTree: 'asset',
      triggerElement: null,
      triggerObserver: null,
      triggerIntersectionRatio: null,
      dialogBoundary: null,
      reopenPopoverWhenVisible: false,
      popoverVisible: false,
      popoverForceHidden: false,
      popoverInstant: false,
      preserveExpansionOnNextOpen: false,
      selectedNode: null,
      selectedNodePath: '',
      selectedTreeKey: '',
      selectedTreeType: '',
      treeReady: {
        asset: false,
        type: false
      },
      localTreeState: {
        asset: {
          data: [],
          defaultExpandedKeys: [],
          loaded: false,
          loading: false,
          loadPromise: null
        },
        type: {
          data: [],
          defaultExpandedKeys: [],
          loaded: false,
          loading: false,
          loadPromise: null
        }
      }
    }
  },
  computed: {
    popoverOptions() {
      const boundary = this.dialogBoundary || 'clippingParents'
      return {
        modifiers: [
          {
            name: 'preventOverflow',
            options: {
              boundary,
              padding: 8,
              altAxis: true,
              tether: true
            }
          },
          {
            name: 'flip',
            options: {
              boundary,
              padding: 8
            }
          }
        ]
      }
    },
    popoverStyle() {
      return this.popoverForceHidden ? { visibility: 'hidden' } : {}
    },
    popoverClass() {
      return `node-search-popper${this.popoverInstant ? ' is-instant' : ''}`
    },
    treeState() {
      if (this.sharedTreeState?.asset && this.sharedTreeState?.type) {
        return this.sharedTreeState
      }
      return this.localTreeState
    },
    selectedNodeLabel() {
      return this.selectedNodePath || this.getNodeLabel(this.selectedNode)
    },
    buttonTitle() {
      return this.selectedNodeLabel || this.$t('NodeFilterTitle')
    },
    treeSettings() {
      return {
        asset: this.createTreeSetting('asset'),
        type: this.createTreeSetting('type')
      }
    },
    treeViews() {
      return [
        {
          name: 'asset',
          title: this.$t('NodeTree'),
          icon: 'fa-solid fa-diagram-project',
          treeComponent: 'XTree',
          treeSetting: this.treeSettings.asset
        },
        {
          name: 'type',
          title: this.$t('TypeTree'),
          icon: 'fa-solid fa-shapes',
          treeComponent: 'XTree',
          treeSetting: this.treeSettings.type
        }
      ]
    }
  },
  watch: {
    popoverVisible(visible) {
      if (visible) {
        this.popoverForceHidden = false
        const preserveExpansion = this.preserveExpansionOnNextOpen
        this.preserveExpansionOnNextOpen = false
        if (preserveExpansion) {
          this.loadTree(this.activeTree)
        } else {
          this.prepareTreeExpansionForOpen()
        }
      } else {
        this.resetTreeSearch()
      }
    },
    activeTree(treeType) {
      if (this.popoverVisible) {
        this.loadTree(treeType)
      }
    }
  },
  mounted() {
    this.triggerElement = this.$refs.triggerButton?.$el || null
    this.dialogBoundary = this.triggerElement?.closest('.el-dialog') || null
    const scrollContainer = this.triggerElement?.closest('.el-dialog__body')
    if (this.triggerElement && scrollContainer && typeof IntersectionObserver !== 'undefined') {
      const visibilityThresholds = Array.from({ length: 21 }, (_, index) => index / 20)
      this.triggerObserver = new IntersectionObserver(
        ([entry]) => {
          const triggerHeight = entry.boundingClientRect.height
          if (triggerHeight <= 0) {
            return
          }
          const visibleRatio = Math.min(entry.intersectionRect.height / triggerHeight, 1)
          const previousRatio = this.triggerIntersectionRatio
          this.triggerIntersectionRatio = visibleRatio
          if (previousRatio === null) {
            return
          }

          const visibilityDelta = visibleRatio - previousRatio
          const movingOutOfView = visibilityDelta < -0.001
          const movingIntoView = visibilityDelta > 0.001
          if (movingOutOfView && visibleRatio < 0.96 && this.popoverVisible) {
            this.reopenPopoverWhenVisible = true
            this.hidePopover(true)
          } else if (movingIntoView && visibleRatio >= 0.05 && this.reopenPopoverWhenVisible) {
            this.reopenPopoverWhenVisible = false
            this.showPopover(true, true)
          }
        },
        {
          root: scrollContainer,
          threshold: visibilityThresholds
        }
      )
      this.triggerObserver.observe(this.triggerElement)
    }
  },
  beforeUnmount() {
    this.triggerObserver?.disconnect()
  },
  methods: {
    preloadTrees() {
      return Promise.all([this.loadTree('asset'), this.loadTree('type')])
    },
    closePopover() {
      this.reopenPopoverWhenVisible = false
      return this.forceHidePopover()
    },
    showPopover(instant = false, preserveExpansion = false) {
      this.popoverInstant = instant
      this.preserveExpansionOnNextOpen = preserveExpansion
      this.popoverVisible = true
      return this.$nextTick()
    },
    hidePopover(instant = false) {
      this.popoverInstant = instant
      this.popoverVisible = false
      return this.$nextTick()
    },
    forceHidePopover() {
      // 外部点击可能已经先更新 visible，仍需在外层 Tab 隐藏触发器前强制隐藏浮层。
      this.popoverForceHidden = true
      this.popoverVisible = false
      return this.$nextTick()
    },
    handlePopoverAfterEnter() {
      this.popoverInstant = false
    },
    handlePopoverAfterLeave() {
      this.popoverForceHidden = false
      this.popoverInstant = false
    },
    getQueryParams() {
      const params = typeof this.queryParams === 'function' ? this.queryParams() : this.queryParams
      return { ...(params || {}) }
    },
    createTreeSetting(treeType) {
      const dataSourceDefinitions = {
        root: {
          load: ({ refresh }) => this.loadTree(treeType, { refresh })
        }
      }
      if (treeType === 'asset' && this.treeAmountLoader) {
        dataSourceDefinitions.metrics = (payload) =>
          this.treeAmountLoader({
            ...payload,
            includeDescendants: this.includeDescendants,
            queryParams: this.getQueryParams()
          })
      } else if (treeType === 'asset' && this.treeAmountUrl) {
        dataSourceDefinitions.metrics = {
          url: this.treeAmountUrl,
          method: 'post',
          data: ({ fresh, nodeIds }) => ({
            fresh,
            include_descendants: this.includeDescendants,
            node_ids: nodeIds
          })
        }
      }
      return createXTreeSetting({
        amountTypes: treeType === 'asset' ? this.treeAmountTypes : [],
        dataSource: createXTreeDataSource(this.$axios, dataSourceDefinitions),
        edit: { drag: { isMove: false } },
        hasRightMenu: false,
        initialExpandedKeys: () => this.treeState[treeType].defaultExpandedKeys,
        loadMode: X_TREE_LOAD_MODES.EAGER,
        readOnly: true,
        selectSyncToRoute: false,
        showAssets: false,
        showCollapse: false,
        showCreate: false,
        showDefaultMenu: false,
        showDelete: false,
        showRefresh: false,
        showSearch: true,
        showUpdate: false,
        toolsPlacement: 'bottom-start',
        toolsTeleported: false,
        virtualize: true,
        virtualizeSearch: true
      })
    },
    getTreePanel(treeType) {
      return treeType === this.activeTree ? this.$refs.nodeTree : null
    },
    resetTreeSearch() {
      this.$refs.nodeTree?.restoreAllNodes()
    },
    showOnlyNodes(nodeIds, options) {
      return this.$refs.nodeTree?.showOnlyNodes?.(nodeIds, options)
    },
    getSelectionSnapshot() {
      if (!this.selectedNode || !this.selectedTreeType || !this.selectedTreeKey) {
        return null
      }
      return {
        treeType: this.selectedTreeType,
        treeKey: this.selectedTreeKey,
        label: this.selectedNodeLabel,
        query: this.getFilterQuery(this.selectedTreeType, this.selectedNode)
      }
    },
    async applySelectionSnapshot(snapshot) {
      if (!snapshot?.treeType || !snapshot?.treeKey) {
        this.clearSelection()
        return
      }
      await this.loadTree(snapshot.treeType)
      const node = this.findTreeNode(this.treeState[snapshot.treeType]?.data, snapshot.treeKey)
      if (!node) {
        this.clearSelection()
        return
      }
      const treeKey = this.getTreeKey(node)
      this.selectedNode = node
      this.selectedNodePath =
        snapshot.label || this.getNodePathLabel(snapshot.treeType, treeKey, node)
      this.selectedTreeKey = String(treeKey)
      this.selectedTreeType = snapshot.treeType
      await this.$nextTick()
      this.syncTreeSelection()
      const query = snapshot.query || this.getFilterQuery(snapshot.treeType, node)
      this.$emit('nodeSearch', query, this.getSelectionSnapshot())
    },
    getTreeKey(node) {
      return node?.meta?.data?.key ?? node?.id
    },
    getNodeId(node) {
      return node?.meta?.data?.id ?? node?.nodeId
    },
    getNodeLabel(node) {
      return node?.name || node?.meta?.data?.value || ''
    },
    getParentTreeKey(node) {
      return node?.pId ?? node?.parent_key ?? node?.meta?.data?.parent_key
    },
    findTreeNode(nodes, treeKey) {
      const target = String(treeKey)
      const stack = [...(nodes || [])]
      while (stack.length) {
        const node = stack.pop()
        if (String(this.getTreeKey(node)) === target) {
          return node
        }
        if (node.children?.length) {
          stack.push(...node.children)
        }
      }
      return null
    },
    findTreeNodePath(nodes, treeKey) {
      const target = String(treeKey)
      const stack = (nodes || []).map((node) => ({ node, path: [node] }))
      while (stack.length) {
        const { node, path } = stack.pop()
        if (String(this.getTreeKey(node)) === target) {
          return path
        }
        for (const child of node.children || []) {
          stack.push({ node: child, path: [...path, child] })
        }
      }
      return []
    },
    getNodePathLabel(treeType, treeKey, node) {
      const labels = this.findTreeNodePath(this.treeState[treeType]?.data, treeKey)
        .map((item) => this.getNodeLabel(item))
        .filter(Boolean)
      const path = labels.join(' / ') || this.getNodeLabel(node)
      return path ? `/ ${path}` : ''
    },
    buildTree(response) {
      const nodes = Array.isArray(response) ? response : response?.results || []
      const treeNodes = nodes.map((node) => ({
        ...node,
        id: this.getTreeKey(node),
        name: this.getNodeLabel(node),
        children: []
      }))

      const nodeMap = new Map()
      treeNodes.forEach((node) => {
        const key = this.getTreeKey(node)
        if (key !== undefined && key !== null && key !== '') {
          nodeMap.set(String(key), node)
        }
      })

      const roots = []
      treeNodes.forEach((node) => {
        const parentKey = this.getParentTreeKey(node)
        const parent =
          parentKey === undefined || parentKey === null || parentKey === ''
            ? null
            : nodeMap.get(String(parentKey))
        if (parent && parent !== node) {
          parent.children.push(node)
        } else {
          roots.push(node)
        }
      })
      return roots
    },
    async loadTree(treeType, { refresh = false } = {}) {
      const state = this.treeState[treeType]
      if (state.loading && state.loadPromise) {
        return state.loadPromise
      }
      if (state.loaded && !refresh) {
        return state.data
      }
      const url = treeType === 'type' ? this.typeTreeUrl : this.treeUrl
      if (!url) {
        return []
      }
      state.loading = true
      state.loadPromise = (async () => {
        try {
          const response = await this.$axios.get(url, {
            params: this.getQueryParams()
          })
          const treeData = this.buildTree(response)
          if (treeType === 'asset') {
            state.defaultExpandedKeys = treeData.map((node) => node.id)
          } else {
            state.defaultExpandedKeys = treeData.flatMap((node) => [
              node.id,
              ...node.children.map((child) => child.id)
            ])
          }
          state.data = treeData
          state.loaded = true
          return treeData
        } catch (error) {
          state.data = []
          return []
        } finally {
          state.loading = false
          state.loadPromise = null
        }
      })()
      return state.loadPromise
    },
    async prepareTreeExpansionForOpen() {
      await this.preloadTrees()
      if (this.selectedTreeType) {
        this.activeTree = this.selectedTreeType
      }
      await this.$nextTick()
      await this.resetTreeExpansionToSelection()
    },
    async resetTreeExpansionToSelection(treeTypes = ['asset', 'type']) {
      await Promise.all(
        treeTypes.map((treeType) => {
          const tree = this.getTreePanel(treeType)
          if (!tree || !this.treeReady?.[treeType]) {
            return undefined
          }
          const hasSelectedNode =
            this.selectedTreeType === treeType && Boolean(this.selectedTreeKey)
          return hasSelectedNode
            ? tree.expandToNode(this.selectedTreeKey)
            : tree.setExpandedKeys(this.treeState[treeType].defaultExpandedKeys)
        })
      )
    },
    handleTreeReady(treeType) {
      this.treeReady ||= { asset: false, type: false }
      this.treeReady[treeType] = true
      this.syncTreeSelection()
      this.resetTreeExpansionToSelection([treeType])
    },
    handleActiveTreeReady({ name }) {
      if (!this.treeReady?.[name]) {
        return
      }
      this.syncTreeSelection()
    },
    handleTreeTabClick() {
      this.$refs.nodeTree?.restoreAllNodes()
    },
    isTreeActionDisabled(treeType) {
      return !this.treeReady?.[treeType] || this.treeState[treeType].loading
    },
    async collapseTree(treeType, close) {
      close?.()
      const tree = this.getTreePanel(treeType)
      if (!tree || this.isTreeActionDisabled(treeType)) {
        return
      }
      await tree.collapseAll()
    },
    getEmptyFilterQuery() {
      return {
        [this.queryKey]: '',
        all: '',
        category: '',
        type: '',
        platform: ''
      }
    },
    getFilterQuery(treeType, node) {
      const query = this.getEmptyFilterQuery()
      if (treeType === 'asset') {
        const nodeId = this.getNodeId(node)
        if (nodeId === undefined || nodeId === null) {
          return null
        }
        query[this.queryKey] = nodeId
        query.all = this.includeDescendants ? 'true' : 'false'
        return query
      }

      const meta = node?.meta || {}
      if (meta.type === 'category') {
        query.category = meta.category
      } else if (meta.type === 'type') {
        query.category = meta.category
        query.type = meta._type
      } else if (meta.type === 'platform') {
        query.platform = node.id
      }
      return query
    },
    isTreeNodeSelected(treeType, node) {
      return (
        this.selectedTreeType === treeType && this.selectedTreeKey === String(this.getTreeKey(node))
      )
    },
    setTreeNodeSelected(treeType, node, selected) {
      if (selected) {
        this.selectTreeNode(treeType, node)
      } else if (this.isTreeNodeSelected(treeType, node)) {
        this.clearSelection()
      }
    },
    handleTreeSelected(treeType, node) {
      this.selectTreeNode(treeType, node)
    },
    selectTreeNode(treeType, node) {
      const treeKey = this.getTreeKey(node)
      if (treeKey === undefined || treeKey === null) {
        return
      }
      const query = this.getFilterQuery(treeType, node)
      if (!query) {
        return
      }
      this.selectedNode = node
      this.selectedNodePath = this.getNodePathLabel(treeType, treeKey, node)
      this.selectedTreeKey = String(treeKey)
      this.selectedTreeType = treeType
      this.syncTreeSelection()
      this.$emit('nodeSearch', query, this.getSelectionSnapshot())
    },
    syncTreeSelection() {
      const treeType = this.activeTree
      const tree = this.getTreePanel(treeType)
      if (!tree || !this.treeReady?.[treeType]) {
        return
      }
      if (this.selectedTreeType !== treeType || !this.selectedTreeKey) {
        tree.clearSelection()
        return
      }
      const node = this.findTreeNode(tree.getAllNodes(), this.selectedTreeKey)
      if (node) {
        tree.selectNode(node)
      }
    },
    clearSelection(close) {
      close?.()
      this.$refs.nodeTree?.clearSelection()
      this.selectedNode = null
      this.selectedNodePath = ''
      this.selectedTreeKey = ''
      this.selectedTreeType = ''
      this.$emit('nodeSearch', this.getEmptyFilterQuery(), null)
    }
  }
}
</script>

<style lang="scss" scoped>
.node-search {
  display: inline-flex;

  &__button.el-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    min-width: 30px;
    height: 30px;
    margin: 0;
    padding: 0;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: #fff;
    color: var(--color-text-primary) !important;

    &:hover,
    &:focus-visible {
      background: rgba(0, 0, 0, 0.05);
      color: var(--color-text-primary) !important;
    }

    .svg-icon {
      width: 12px;
      height: 12px;
      margin: 0;
      color: inherit !important;
      fill: currentColor !important;
      opacity: 0.72;
    }
  }

  &__indicator {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 5px;
    height: 5px;
    border: 1px solid #fff;
    border-radius: 50%;
    background: var(--el-color-primary);
  }
}
</style>

<style lang="scss">
.node-search-popover-enter-active {
  transition: opacity 0.12s ease-out;

  .node-search-panel {
    transition: transform 0.12s ease-out;
  }
}

.node-search-popover-leave-active {
  transition: opacity 0.1s ease-in;

  .node-search-panel {
    transition: transform 0.1s ease-in;
  }
}

.node-search-popover-enter-from,
.node-search-popover-leave-to {
  opacity: 0;

  .node-search-panel {
    transform: translateY(-3px);
  }
}

.node-search-popper.is-instant {
  transition: none;

  .node-search-panel {
    transition: none;
  }
}

.node-search-popper.el-popper {
  max-width: calc(100vw - 24px);
  padding: 0;

  .node-search-panel {
    min-width: 0;
    border-radius: var(--el-popover-border-radius, 4px);
    background: var(--el-bg-color-overlay, #fff);
  }

  .node-search-panel__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    min-height: 38px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .node-search-panel__title {
    flex: 1;
    min-width: 0;
    color: var(--el-text-color-regular);
    font-size: 13px;
    line-height: 20px;
    overflow-wrap: anywhere;
  }

  .node-search-panel__tree-switcher.tree-tab.is-fill-height {
    width: 100%;
    height: min(400px, 60vh);
    min-height: 260px;
  }

  .node-search-panel__tree-switcher > .tree-panel > .x-tree {
    min-height: 0;
  }

  .node-search-panel__tree-switcher > .tree-panel > .x-tree > .x-tree__body {
    border-radius: 0 0 var(--el-popover-border-radius, 4px) var(--el-popover-border-radius, 4px);
  }

  .node-search-panel__checkbox {
    order: -1;
    display: inline-flex;
    flex: none;
    align-items: center;
    align-self: stretch;
    padding-left: 2px;
  }

  .node-search-panel__checkbox .el-checkbox {
    height: 100%;
    margin-right: 2px;
  }
}

.node-search-tooltip.el-popper {
  max-width: min(320px, calc(100vw - 24px));
  line-height: 18px;
  overflow-wrap: anywhere;
  white-space: normal;
}
</style>
