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
          :class="{ 'is-active': selectedNode !== null }"
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
              <div v-loading="treeState.asset.loading" class="node-search-panel__tree">
                <el-tree
                  ref="assetTree"
                  :check-on-click-node="false"
                  :check-strictly="true"
                  :data="treeState.asset.data"
                  :default-expanded-keys="treeState.asset.defaultExpandedKeys"
                  :expand-on-click-node="true"
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
              <div v-loading="treeState.type.loading" class="node-search-panel__tree">
                <el-tree
                  ref="typeTree"
                  :check-on-click-node="false"
                  :check-strictly="true"
                  :data="treeState.type.data"
                  :default-expanded-keys="treeState.type.defaultExpandedKeys"
                  :expand-on-click-node="true"
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
            <el-tooltip :content="$t('NodeFilterExpandAll')" placement="top" :show-after="300">
              <span class="node-search-panel__tree-action-trigger">
                <el-button
                  :aria-label="$t('NodeFilterExpandAll')"
                  :disabled="!treeState[activeTree].loaded || treeState[activeTree].loading"
                  class="node-search-panel__tree-action"
                  link
                  @click.stop="setActiveTreeExpanded(true)"
                >
                  <svg-icon icon-class="tree-expand-all" />
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
      dialogBoundary: null,
      reopenPopoverWhenVisible: false,
      popoverVisible: false,
      popoverForceHidden: false,
      popoverInstant: false,
      selectedNode: null,
      selectedNodePath: '',
      selectedTreeKey: '',
      selectedTreeType: '',
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
    }
  },
  watch: {
    popoverVisible(visible) {
      if (visible) {
        this.popoverForceHidden = false
        this.loadTree(this.activeTree)
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
      this.triggerObserver = new IntersectionObserver(
        ([entry]) => {
          const rootBounds = entry.rootBounds
          if (!rootBounds) {
            return
          }
          const tolerance = 1
          const fullyVisibleVertically =
            entry.boundingClientRect.top >= rootBounds.top - tolerance &&
            entry.boundingClientRect.bottom <= rootBounds.bottom + tolerance
          if (!fullyVisibleVertically && this.popoverVisible) {
            this.reopenPopoverWhenVisible = true
            this.hidePopover(true)
          } else if (fullyVisibleVertically && this.reopenPopoverWhenVisible) {
            this.reopenPopoverWhenVisible = false
            this.showPopover(true)
          }
        },
        {
          root: scrollContainer,
          threshold: [0, 1]
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
    showPopover(instant = false) {
      this.popoverInstant = instant
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
      } catch (error) {
        state.data = []
      } finally {
        state.loading = false
      }
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

      const initialExpandedKeys = new Set(
        this.treeState[treeType].defaultExpandedKeys.map((key) => String(key))
      )
      const isInitialState = expandableNodes.every((item) => {
        const node = tree.getNode(item.id)
        return Boolean(node?.expanded) === initialExpandedKeys.has(String(item.id))
      })
      const restoreInitialState = !expanded && !isInitialState

      expandableNodes.forEach((item) => {
        const node = tree.getNode(item.id)
        if (!node) {
          return
        }
        const shouldExpand =
          expanded || (restoreInitialState && initialExpandedKeys.has(String(item.id)))
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
      this.$emit('nodeSearch', query)
    },
    clearSelection() {
      this.$refs.assetTree?.setCheckedKeys([])
      this.$refs.typeTree?.setCheckedKeys([])
      this.selectedNode = null
      this.selectedNodePath = ''
      this.selectedTreeKey = ''
      this.selectedTreeType = ''
      this.$emit('nodeSearch', this.getEmptyFilterQuery())
    }
  }
}
</script>

<style lang="scss" scoped>
.node-search {
  display: inline-flex;

  &__button.el-button {
    position: relative;
    width: 34px;
    height: 30px;
    padding: 0;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: #fff;
    color: var(--color-icon-primary);

    &:hover,
    &:focus-visible {
      border-color: var(--el-color-primary-light-5);
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }

    &.is-active {
      border-color: var(--el-color-primary-light-5);
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
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
    }

    .el-tabs__nav-wrap::after {
      height: 1px;
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
