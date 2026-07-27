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

      <div class="node-search-panel">
        <div class="node-search-panel__header">
          <span :title="selectedNodeLabel" class="node-search-panel__title">
            {{ selectedNodeLabel || $t('NodeFilterAll') }}
          </span>
        </div>

        <div class="node-search-panel__tabs-wrap">
          <el-tabs v-model="activeTree" class="node-search-panel__tabs">
            <el-tab-pane :label="$t('AssetTree')" name="asset">
              <div class="node-search-panel__search">
                <el-input
                  v-model="nodeQueries.asset"
                  :placeholder="$t('NodeFilterSearch')"
                  clearable
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
              <div v-loading="treeState.asset.loading" class="node-search-panel__tree">
                <el-tree
                  ref="assetTree"
                  :check-on-click-node="false"
                  :check-strictly="true"
                  :data="treeState.asset.data"
                  :default-expanded-keys="treeState.asset.defaultExpandedKeys"
                  :expand-on-click-node="true"
                  :filter-node-method="filterNode"
                  :props="treeProps"
                  node-key="id"
                  show-checkbox
                  @check="handleAssetCheck"
                >
                  <template #default="{ data }">
                    <span :title="getNodeLabel(data)" class="node-search-panel__node-label">
                      {{ getNodeLabel(data) }}
                    </span>
                  </template>
                </el-tree>
              </div>
            </el-tab-pane>

            <el-tab-pane :label="$t('TypeTree')" name="type">
              <div class="node-search-panel__search">
                <el-input
                  v-model="nodeQueries.type"
                  :placeholder="$t('NodeFilterSearch')"
                  clearable
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
              <div v-loading="treeState.type.loading" class="node-search-panel__tree">
                <el-tree
                  ref="typeTree"
                  :check-on-click-node="false"
                  :check-strictly="true"
                  :data="treeState.type.data"
                  :default-expanded-keys="treeState.type.defaultExpandedKeys"
                  :expand-on-click-node="true"
                  :filter-node-method="filterNode"
                  :props="treeProps"
                  node-key="id"
                  show-checkbox
                  @check="handleTypeCheck"
                >
                  <template #default="{ data }">
                    <span :title="getNodeLabel(data)" class="node-search-panel__node-label">
                      {{ getNodeLabel(data) }}
                    </span>
                  </template>
                </el-tree>
              </div>
            </el-tab-pane>
          </el-tabs>

          <div class="node-search-panel__tree-actions">
            <el-tooltip :content="activeExpandTitle" placement="top" :show-after="300">
              <span class="node-search-panel__tree-action-trigger">
                <el-button
                  :aria-label="activeExpandTitle"
                  :disabled="!treeState[activeTree].loaded || treeState[activeTree].loading"
                  class="node-search-panel__tree-action"
                  link
                  @click.stop="setActiveTreeExpanded(true)"
                >
                  <svg-icon v-if="activeExpandUsesAll" icon-class="tree-expand-all" />
                  <el-icon v-else><Aim /></el-icon>
                </el-button>
              </span>
            </el-tooltip>
            <el-tooltip :content="$t('NodeFilterCollapse')" placement="top" :show-after="300">
              <span class="node-search-panel__tree-action-trigger">
                <el-button
                  :aria-label="$t('NodeFilterCollapse')"
                  :disabled="!treeState[activeTree].loaded || treeState[activeTree].loading"
                  class="node-search-panel__tree-action"
                  link
                  @click.stop="setActiveTreeExpanded(false)"
                >
                  <svg-icon icon-class="tree-collapse-all" />
                </el-button>
              </span>
            </el-tooltip>
            <el-tooltip :content="$t('NodeFilterClear')" placement="top" :show-after="300">
              <span class="node-search-panel__tree-action-trigger">
                <el-button
                  :aria-label="$t('NodeFilterClear')"
                  :disabled="!selectedNode"
                  class="node-search-panel__tree-action"
                  link
                  @click.stop="clearSelection"
                >
                  <el-icon class="node-search-panel__clear-icon"><Brush /></el-icon>
                </el-button>
              </span>
            </el-tooltip>
          </div>
        </div>
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
export default {
  name: 'NodeSearch',
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
      treeExpandAllNext: {
        asset: false,
        type: false
      },
      selectedNode: null,
      selectedNodePath: '',
      selectedTreeKey: '',
      selectedTreeType: '',
      nodeQueries: {
        asset: '',
        type: ''
      },
      localTreeState: {
        asset: {
          data: [],
          defaultExpandedKeys: [],
          loaded: false,
          loading: false
        },
        type: {
          data: [],
          defaultExpandedKeys: [],
          loaded: false,
          loading: false
        }
      },
      treeProps: {
        label: 'name',
        children: 'children'
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
    hasActiveTreeSelection() {
      return this.selectedTreeType === this.activeTree && Boolean(this.selectedTreeKey)
    },
    activeExpandUsesAll() {
      return !this.hasActiveTreeSelection || this.treeExpandAllNext[this.activeTree]
    },
    activeExpandTitle() {
      return this.activeExpandUsesAll
        ? this.$t('NodeFilterExpandAll')
        : this.$t('TreeResourceSelectExpandSelected')
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
        this.nodeQueries.asset = ''
        this.nodeQueries.type = ''
      }
    },
    activeTree(treeType) {
      if (this.popoverVisible) {
        this.loadTree(treeType).then(() => {
          this.filterTree(treeType, this.nodeQueries[treeType])
        })
      }
    },
    'nodeQueries.asset'(value) {
      this.filterTree('asset', value)
    },
    'nodeQueries.type'(value) {
      this.filterTree('type', value)
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
      const findNode = (nodes) => {
        for (const node of nodes || []) {
          if (String(this.getTreeKey(node)) === String(snapshot.treeKey)) {
            return node
          }
          const matched = findNode(node.children)
          if (matched) {
            return matched
          }
        }
        return null
      }
      const node = findNode(this.treeState[snapshot.treeType]?.data)
      if (!node) {
        this.clearSelection()
        return
      }
      const treeKey = this.getTreeKey(node)
      this.$refs.assetTree?.setCheckedKeys(snapshot.treeType === 'asset' ? [treeKey] : [])
      this.$refs.typeTree?.setCheckedKeys(snapshot.treeType === 'type' ? [treeKey] : [])
      this.selectedNode = node
      this.selectedNodePath =
        snapshot.label || this.getNodePathLabel(snapshot.treeType, treeKey, node)
      this.selectedTreeKey = String(treeKey)
      this.selectedTreeType = snapshot.treeType
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
    filterNode(query, node) {
      const keyword = query.trim().toLocaleLowerCase()
      if (!keyword) {
        return true
      }
      return this.getNodeLabel(node).toLocaleLowerCase().includes(keyword)
    },
    filterTree(treeType, query) {
      this.$nextTick(() => {
        this.$refs[`${treeType}Tree`]?.filter(query)
      })
    },
    getParentTreeKey(node) {
      return node?.pId ?? node?.parent_key ?? node?.meta?.data?.parent_key
    },
    getNodePathLabel(treeType, treeKey, node) {
      const treeNode = this.$refs[`${treeType}Tree`]?.getNode(treeKey)
      const labels = []
      let currentNode = treeNode
      while (currentNode?.level > 0) {
        const label = this.getNodeLabel(currentNode.data)
        if (label) {
          labels.unshift(label)
        }
        currentNode = currentNode.parent
      }
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
    async loadTree(treeType) {
      const state = this.treeState[treeType]
      if (state.loaded || state.loading) {
        return
      }
      const url = treeType === 'type' ? this.typeTreeUrl : this.treeUrl
      if (!url) {
        return
      }
      state.loading = true
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
        this.filterTree(treeType, this.nodeQueries[treeType])
      } catch (error) {
        state.data = []
      } finally {
        state.loading = false
      }
    },
    async prepareTreeExpansionForOpen() {
      await this.preloadTrees()
      if (this.selectedTreeType) {
        this.activeTree = this.selectedTreeType
      }
      await this.$nextTick()
      this.resetTreeExpansionToSelection()
    },
    resetTreeExpansionToSelection() {
      const treeTypes = ['asset', 'type']
      treeTypes.forEach((treeType) => {
        const tree = this.$refs[`${treeType}Tree`]
        if (!tree) {
          return
        }

        const expandableNodes = []
        const visit = (nodes) => {
          nodes.forEach((item) => {
            if (item.children.length === 0) {
              return
            }
            expandableNodes.push(item)
            visit(item.children)
          })
        }
        visit(this.treeState[treeType].data)

        const selectedAncestorKeys = new Set()
        const hasSelectedNode = this.selectedTreeType === treeType && Boolean(this.selectedTreeKey)
        let selectedTreeNode = hasSelectedNode ? tree.getNode(this.selectedTreeKey) : null
        const selectedNodeFound = Boolean(selectedTreeNode)
        const initialExpandedKeys = new Set(
          this.treeState[treeType].defaultExpandedKeys.map((key) => String(key))
        )
        selectedTreeNode = selectedTreeNode?.parent
        while (selectedTreeNode?.level > 0) {
          selectedAncestorKeys.add(String(this.getTreeKey(selectedTreeNode.data)))
          selectedTreeNode = selectedTreeNode.parent
        }

        expandableNodes.forEach((item) => {
          const node = tree.getNode(item.id)
          const itemKey = String(item.id)
          const shouldExpand = selectedNodeFound
            ? selectedAncestorKeys.has(itemKey)
            : initialExpandedKeys.has(itemKey)
          if (shouldExpand) {
            node?.expand()
          } else {
            node?.collapse()
          }
        })
        this.treeExpandAllNext[treeType] = selectedNodeFound
      })
    },
    setActiveTreeExpanded(expanded) {
      const treeType = this.activeTree
      const tree = this.$refs[`${treeType}Tree`]
      if (!tree) {
        return
      }

      const expandableNodes = []
      const visit = (nodes) => {
        nodes.forEach((item) => {
          if (item.children.length === 0) {
            return
          }
          expandableNodes.push(item)
          visit(item.children)
        })
      }
      visit(this.treeState[treeType].data)

      if (expanded) {
        if (this.activeExpandUsesAll) {
          expandableNodes.forEach((item) => tree.getNode(item.id)?.expand())
          this.treeExpandAllNext[treeType] = false
          return
        }

        const selectedAncestorKeys = new Set()
        let selectedTreeNode = tree.getNode(this.selectedTreeKey)?.parent
        while (selectedTreeNode?.level > 0) {
          selectedAncestorKeys.add(String(this.getTreeKey(selectedTreeNode.data)))
          selectedTreeNode = selectedTreeNode.parent
        }
        expandableNodes.forEach((item) => {
          const node = tree.getNode(item.id)
          if (selectedAncestorKeys.has(String(item.id))) {
            node?.expand()
          } else {
            node?.collapse()
          }
        })
        this.treeExpandAllNext[treeType] = true
        return
      }

      const initialExpandedKeys = new Set(
        this.treeState[treeType].defaultExpandedKeys.map((key) => String(key))
      )
      const isInitialState = expandableNodes.every((item) => {
        const node = tree.getNode(item.id)
        return Boolean(node?.expanded) === initialExpandedKeys.has(String(item.id))
      })
      const allCollapsed = expandableNodes.every((item) => !tree.getNode(item.id)?.expanded)
      if (!expanded && allCollapsed) {
        return
      }
      const restoreInitialState = !expanded && !isInitialState

      expandableNodes.forEach((item) => {
        const node = tree.getNode(item.id)
        if (!node) {
          return
        }
        const shouldExpand = restoreInitialState && initialExpandedKeys.has(String(item.id))
        if (shouldExpand) {
          node.expand()
        } else {
          node.collapse()
        }
      })
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
    handleAssetCheck(node, state) {
      this.handleCheck('asset', node, state)
    },
    handleTypeCheck(node, state) {
      this.handleCheck('type', node, state)
    },
    handleCheck(treeType, node, { checkedKeys }) {
      const treeKey = this.getTreeKey(node)
      if (treeKey === undefined || treeKey === null) {
        return
      }

      const normalizedTreeKey = String(treeKey)
      const checked = checkedKeys.some((key) => String(key) === normalizedTreeKey)
      if (!checked) {
        if (this.selectedTreeType === treeType && this.selectedTreeKey === normalizedTreeKey) {
          this.clearSelection()
        }
        return
      }

      const query = this.getFilterQuery(treeType, node)
      if (!query) {
        return
      }

      this.$refs.assetTree?.setCheckedKeys(treeType === 'asset' ? [treeKey] : [])
      this.$refs.typeTree?.setCheckedKeys(treeType === 'type' ? [treeKey] : [])
      this.selectedNode = node
      this.selectedNodePath = this.getNodePathLabel(treeType, treeKey, node)
      this.selectedTreeKey = normalizedTreeKey
      this.selectedTreeType = treeType
      this.treeExpandAllNext[treeType] = false
      this.$emit('nodeSearch', query, this.getSelectionSnapshot())
    },
    clearSelection() {
      this.$refs.assetTree?.setCheckedKeys([])
      this.$refs.typeTree?.setCheckedKeys([])
      this.selectedNode = null
      this.selectedNodePath = ''
      this.selectedTreeKey = ''
      this.selectedTreeType = ''
      this.treeExpandAllNext.asset = false
      this.treeExpandAllNext.type = false
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

  .node-search-panel__tabs {
    .el-tabs__header {
      margin: 0;
      padding: 0 94px 0 12px;
      border-bottom: 1px solid var(--el-border-color-light);
    }

    .el-tabs__nav-wrap::after {
      display: none;
    }

    .el-tabs__item {
      height: 36px;
      padding: 0 12px;
      font-size: 13px;
      font-weight: 400;
    }
  }

  .node-search-panel__tabs-wrap {
    position: relative;
  }

  .node-search-panel__tree-actions {
    position: absolute;
    z-index: 1;
    top: 0;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 2px;
    height: 36px;
  }

  .node-search-panel__search {
    padding: 10px 10px 2px;

    .el-input__wrapper {
      min-height: 30px;
      border-radius: 3px;
      box-shadow: 0 0 0 1px var(--el-border-color) inset !important;

      &:hover,
      &.is-focus {
        box-shadow: 0 0 0 1px var(--el-border-color) inset !important;
      }
    }
  }

  .node-search-panel__tree-action-trigger {
    display: inline-flex;
  }

  .node-search-panel__tree-action.el-button {
    width: 24px;
    height: 24px;
    margin-left: 0;
    padding: 0;
    border-radius: 4px;
    color: var(--el-text-color-secondary);
    font-size: 16px;

    &:hover:not(.is-disabled),
    &:focus-visible:not(.is-disabled) {
      background: var(--el-fill-color-light);
      color: var(--el-text-color-primary);
    }

    .svg-icon {
      width: 16px;
      height: 16px;
    }

    .el-icon {
      font-size: 14px;
    }
  }

  .node-search-panel__clear-icon {
    transform: rotate(180deg);
  }

  .node-search-panel__tree {
    max-height: min(360px, 55vh);
    overflow: auto;
    padding: 8px;

    .el-tree {
      width: max-content;
      min-width: 100%;
    }
  }

  .node-search-panel__node-label {
    display: block;
    padding-right: 8px;
    font-size: 13px;
    white-space: nowrap;
  }
}

.node-search-tooltip.el-popper {
  max-width: min(320px, calc(100vw - 24px));
  line-height: 18px;
  overflow-wrap: anywhere;
  white-space: normal;
}
</style>
