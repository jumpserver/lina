<template>
  <div
    :class="{ 'is-search-visible': isPanelSearchVisible }"
    :style="{ '--x-tree-row-height': `${nodeRowHeight}px` }"
    class="x-tree"
  >
    <div
      v-if="hasTreeTools"
      :class="{ 'has-header-search': isHeaderSearch }"
      class="x-tree__header-actions"
    >
      <el-input
        v-if="isHeaderSearch"
        ref="searchInput"
        v-model="searchValue"
        :placeholder="$t('NodeFilterSearch')"
        class="x-tree__search x-tree__header-search"
        clearable
        @input="handleSearchInput"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <span v-if="$slots['toolbar-prepend']" class="x-tree__toolbar-prepend">
        <slot
          :collapse-disabled="loading || treeData.length === 0"
          :loading="loading"
          name="toolbar-prepend"
        />
      </span>
      <el-button
        v-if="hasSearchToggle"
        :aria-label="$t('TreeActionSearch')"
        :class="{ 'is-active': searchVisible }"
        class="x-tree__tool-button"
        @click="toggleSearch"
      >
        <el-icon class="x-tree__tool-icon"><Search /></el-icon>
      </el-button>
      <el-dropdown
        v-if="hasTreeMenu"
        ref="toolsDropdown"
        :hide-timeout="160"
        :placement="treeSetting.toolsPlacement"
        popper-class="x-tree-tools-popper"
        :show-timeout="80"
        :teleported="treeSetting.toolsTeleported"
        trigger="hover"
        @command="handleTreeToolCommand"
      >
        <el-button :aria-label="$t('TreeActions')" class="x-tree__tool-button">
          <el-icon class="x-tree__tool-icon"><More /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu class="x-tree-tools__menu">
            <el-dropdown-item
              v-if="treeSetting.showCollapse"
              :disabled="loading || treeData.length === 0"
              command="collapse"
            >
              <span class="x-tree-tools__icon">
                <svg-icon icon-class="tree-collapse-all" />
              </span>
              <span>{{ $t('TreeActionCollapse') }}</span>
            </el-dropdown-item>
            <el-dropdown-item v-if="treeSetting.showRefresh" command="refresh">
              <span class="x-tree-tools__icon"><svg-icon icon-class="refresh" /></span>
              <span>{{ $t('Refresh') }}</span>
            </el-dropdown-item>
            <template v-if="treeSetting.showAssetScope">
              <li v-if="hasTreeMenuOperations" class="x-tree-tools__divider" />
              <li class="x-tree-settings__title">{{ $t('AssetScope') }}</li>
              <li class="x-tree-settings__radio-list" @click.capture="closeToolsDropdown">
                <el-radio-group :model-value="assetScope" @change="handleAssetScopeChange">
                  <el-tooltip
                    :content="$t('AssetScopeWithDescendantsHelp')"
                    :persistent="false"
                    :show-after="400"
                    placement="right"
                    :teleported="false"
                  >
                    <el-radio class="x-tree-settings__radio" value="0">
                      {{ $t('AssetScopeWithDescendants') }}
                    </el-radio>
                  </el-tooltip>
                  <el-tooltip
                    :content="$t('AssetScopeDirectHelp')"
                    :persistent="false"
                    :show-after="400"
                    placement="right"
                    :teleported="false"
                  >
                    <el-radio class="x-tree-settings__radio" value="1">
                      {{ $t('AssetScopeDirect') }}
                    </el-radio>
                  </el-tooltip>
                </el-radio-group>
              </li>
            </template>
            <slot :close="closeToolsDropdown" name="tools-menu" />
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <transition
      :duration="{ enter: 110, leave: 0 }"
      name="x-tree-search"
      @after-enter="focusSearchInput"
    >
      <div v-if="isPanelSearchVisible" class="x-tree__search-row">
        <el-input
          ref="searchInput"
          v-model="searchValue"
          :placeholder="$t('NodeFilterSearch')"
          class="x-tree__search"
          clearable
          @input="handleSearchInput"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </transition>

    <div
      v-loading="loading"
      ref="treeBody"
      :class="{
        'is-empty': !loading && treeData.length === 0,
        'is-virtual': useVirtualTree
      }"
      class="x-tree__body compact-loading"
      @scroll.capture.passive="handleTreeAmountScroll"
      @wheel.capture.passive="handleTreeWheelCapture"
    >
      <div ref="treeViewport" class="x-tree__viewport">
        <el-tree-v2
          v-if="useVirtualTree"
          :key="treeKey"
          ref="tree"
          :data="treeData"
          :default-expanded-keys="initialExpandedKeys"
          empty-text=""
          :expand-on-click-node="false"
          :filter-method="filterNode"
          :height="virtualTreeHeight"
          :item-size="nodeRowHeight"
          :props="virtualTreeProps"
          highlight-current
          @node-click="handleNodeRowClick"
          @node-contextmenu="handleNodeContextMenu"
          @node-collapse="handleNodeCollapse"
          @node-drop="handleVirtualNodeDrop"
          @node-expand="handleNodeExpand"
        >
          <template #default="{ node, data }">
            <span
              :draggable="canDragData(data)"
              :title="getNodeTitle(data)"
              :class="{
                'is-disabled': isNodeDisabled(data),
                'is-operation-target': isOperationTarget(data),
                'is-virtual-drop-target': isVirtualDropTarget(data)
              }"
              class="x-tree__node"
              @dragend="handleVirtualDragEnd"
              @dragenter="handleVirtualDragOver($event, data)"
              @dragleave="handleVirtualDragLeave($event, data)"
              @dragover="handleVirtualDragOver($event, data)"
              @dragstart.stop="handleVirtualDragStart($event, data, node)"
            >
              <button
                :aria-label="getNodeLabel(data)"
                class="x-tree__node-toggle"
                type="button"
                @click.stop="handleNodeLabelClick($event, data)"
              >
                <slot
                  :data="data"
                  :expanded="node.expanded"
                  :leaf="isLeafNode(data)"
                  :node="node"
                  name="node-icon"
                >
                  <TreeFolderIcon :leaf="isLeafNode(data)" :expanded="node.expanded" />
                </slot>
              </button>
              <el-input
                v-if="editingKey === String(data.id)"
                ref="renameInput"
                v-model="editValue"
                class="x-tree__rename"
                size="small"
                @blur="finishRename(data)"
                @click.stop
                @keydown.enter.prevent="$event.target.blur()"
                @keydown.esc.prevent="cancelRename"
              />
              <span
                v-else
                class="x-tree__node-select"
                @click.stop="handleNodeLabelClick($event, data)"
              >
                <span class="x-tree__node-label">{{ getNodeLabel(data) }}</span>
                <span
                  v-if="hasNodeAmount(data)"
                  :title="getNodeAmountTitle(data) || undefined"
                  class="x-tree__node-amount"
                >
                  ({{ getNodeAmount(data) }})
                </span>
              </span>
              <slot :data="data" :expanded="node.expanded" :node="node" name="node-actions" />
            </span>
          </template>
        </el-tree-v2>

        <el-tree
          v-else
          :key="treeKey"
          ref="tree"
          :allow-drag="allowDrag"
          :allow-drop="allowDrop"
          :data="treeData"
          :draggable="canMove"
          empty-text=""
          :expand-on-click-node="true"
          :filter-node-method="filterNode"
          :lazy="isLazyLoad"
          :load="isLazyLoad ? loadNode : undefined"
          :props="treeProps"
          highlight-current
          node-key="id"
          @node-click="handleNodeRowClick"
          @node-contextmenu="handleNodeContextMenu"
          @node-collapse="handleNodeCollapse"
          @node-drag-end="handleNodeDragEnd"
          @node-drag-start="handleNodeDragStart"
          @node-drop="handleNodeDrop"
          @node-expand="handleNodeExpand"
        >
          <template #default="{ node, data }">
            <span
              :class="{
                'is-disabled': isNodeDisabled(data),
                'is-operation-target': isOperationTarget(data)
              }"
              class="x-tree__node"
              :title="getNodeTitle(data)"
            >
              <button
                :aria-label="getNodeLabel(data)"
                class="x-tree__node-toggle"
                type="button"
                @click.stop="handleNodeLabelClick($event, data)"
              >
                <slot
                  :data="data"
                  :expanded="node.expanded"
                  :leaf="isLeafNode(data)"
                  :node="node"
                  name="node-icon"
                >
                  <TreeFolderIcon :leaf="isLeafNode(data)" :expanded="node.expanded" />
                </slot>
              </button>
              <el-input
                v-if="editingKey === String(data.id)"
                ref="renameInput"
                v-model="editValue"
                class="x-tree__rename"
                size="small"
                @blur="finishRename(data)"
                @click.stop
                @keydown.enter.prevent="$event.target.blur()"
                @keydown.esc.prevent="cancelRename"
              />
              <span
                v-else
                class="x-tree__node-select"
                @click.stop="handleNodeLabelClick($event, data)"
              >
                <span class="x-tree__node-label">
                  {{ getNodeLabel(data) }}
                </span>
                <span
                  v-if="hasNodeAmount(data)"
                  :title="getNodeAmountTitle(data) || undefined"
                  class="x-tree__node-amount"
                >
                  ({{ getNodeAmount(data) }})
                </span>
              </span>
              <slot :data="data" :expanded="node.expanded" :node="node" name="node-actions" />
            </span>
          </template>
        </el-tree>

        <el-empty
          v-if="!loading && treeData.length === 0"
          :description="$t('Empty')"
          :image-size="56"
        />
      </div>
    </div>

    <div
      v-show="menuVisible"
      ref="contextMenu"
      :style="menuStyle"
      class="x-tree-context-menu"
      @contextmenu.prevent
      @mousedown.stop
    >
      <ul class="x-tree-context-menu__list" @click="handleContextMenuClick">
        <template v-for="item in menu" :key="item.id">
          <li
            v-if="hasMenuItem(item)"
            :id="item.id"
            :class="{ disabled: checkDisabled(item) }"
            class="rmenu x-tree-context-menu__item"
            tabindex="-1"
            @click="handleMenuItemClick(item)"
          >
            <Icon :icon="item.icon" class="x-tree-context-menu__icon" />
            {{ item.name }}
          </li>
          <li v-if="item.divided" class="divider x-tree-context-menu__divider" />
        </template>
        <slot :close="hideRMenu" :data="currentNode" name="rMenu" />
      </ul>
    </div>
  </div>
</template>

<script>
import axiosRetry from 'axios-retry'
import Icon from '@/components/Widgets/Icon'
import TreeFolderIcon from '@/components/Tree/TreeFolderIcon.vue'
import { getShowCurrentAssetValue, setShowCurrentAssetValue } from '@/utils/common/index'
import { createXTreeSetting, X_TREE_LOAD_MODES, X_TREE_SEARCH_PLACEMENTS } from './config'

const DEFAULT_NODE_ROW_HEIGHT = 28

function appendUrlParam(url, key, value) {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`
}

function getAssetScopeValue(cookie, setting = {}) {
  const storageKey = setting.assetScopeStorageKey
  if (!storageKey) {
    return getShowCurrentAssetValue(cookie)
  }
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null
  return stored === '0' || stored === '1' ? stored : String(setting.defaultAssetScope || '0')
}

function setAssetScopeValue(cookie, setting, value) {
  const storageKey = setting.assetScopeStorageKey
  if (!storageKey) {
    setShowCurrentAssetValue(cookie, value)
    return
  }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, String(value))
  }
}

export default {
  name: 'XTree',
  components: { Icon, TreeFolderIcon },
  props: {
    setting: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['search-state-change', 'selected', 'tree-init-finish', 'url-change'],
  data() {
    return {
      treeData: [],
      normalTreeData: [],
      currentNode: null,
      structureLoading: false,
      searchLoading: false,
      treeKey: 0,
      searchValue: '',
      searchVisible: false,
      searchFocusFrame: null,
      assetScope: getAssetScopeValue(this.$cookie, this.setting),
      searchMode: false,
      localFilterMode: false,
      localFilterNodeIds: new Set(),
      menuVisible: false,
      menuPosition: { x: 0, y: 0 },
      editingKey: '',
      editValue: '',
      renameSource: '',
      renameAssetsAmount: null,
      searchRequestId: 0,
      searchAbortController: null,
      structureRequestId: 0,
      structureAbortController: null,
      childrenAbortControllers: new Map(),
      nodeChildrenViewSources: new Map(),
      amountRequestId: 0,
      amountAbortController: null,
      amountQueue: [],
      amountQueuedIds: new Set(),
      freshAmountNodeIds: new Set(),
      nodeAmounts: new Map(),
      normalNodeAmounts: null,
      normalTreeDeferredBySearch: false,
      amountWorkerRunning: false,
      amountScrollFrame: null,
      amountLoadedRowEnd: 0,
      amountAllRowsScheduled: false,
      nextAmountBatchFresh: false,
      suppressExpandAmountLoading: false,
      expandedNodeIds: new Set(),
      normalExpandedNodeIds: null,
      treeNodeCount: 0,
      normalTreeNodeCount: 0,
      virtualTreeHeight: 500,
      runtimeEffectsActive: false,
      runtimeEffectsGeneration: 0,
      treeResizeObserver: null,
      treeResizeFrame: null,
      virtualDraggingNode: null,
      virtualDropTargetId: '',
      dragPreviewElement: null,
      dragSourceAncestorNodes: [],
      dragSourcePlacement: null,
      treeProps: {
        children: 'children',
        label: 'name',
        isLeaf: '_isLeaf'
      },
      virtualTreeProps: {
        children: 'children',
        label: 'name',
        value: 'id'
      }
    }
  },
  computed: {
    loading() {
      // Structure and search requests have independent generations. Once a
      // search tree is visible, a slower background root request must neither
      // clear nor keep that search result behind its loading overlay.
      return this.searchLoading || (!this.searchMode && this.structureLoading)
    },
    treeSetting() {
      const merged = createXTreeSetting(
        _.merge(
          {
            showDefaultMenu: true,
            showMenu: false,
            showCreate: true,
            showDelete: true,
            showUpdate: true,
            showSearch: false,
            searchPlacement: X_TREE_SEARCH_PLACEMENTS.PANEL,
            showCollapse: false,
            showRefresh: false,
            showAssetScope: false,
            toolsPlacement: 'bottom-start',
            toolsTeleported: true,
            showAssets: false,
            hasRightMenu: true,
            selectSyncToRoute: true,
            structureUrl: '',
            initialData: null,
            initialAmounts: null,
            initialAssetScope: '',
            countUrl: '',
            countBatchSize: 100,
            countProgressiveBatchSize: 100,
            amountTypes: ['node'],
            operationNodeId: '',
            readOnly: false,
            nodeRowHeight: DEFAULT_NODE_ROW_HEIGHT,
            initialExpandedKeys: null,
            lazyLoad: true,
            virtualThreshold: 1000,
            virtualize: true,
            virtualizeSearch: true,
            menu: [],
            callback: {}
          },
          this.setting
        )
      )
      // Lodash merges arrays by index, but amountTypes is a replace-style
      // allowlist. Preserve an explicitly empty list and avoid leaking the
      // default `node` type into a caller's custom list.
      if (Array.isArray(this.setting.amountTypes)) {
        merged.amountTypes = [...this.setting.amountTypes]
      }
      return merged
    },
    isLazyLoad() {
      return this.treeSetting.loadMode === X_TREE_LOAD_MODES.LAZY
    },
    nodeRowHeight() {
      return Math.max(1, Number(this.treeSetting.nodeRowHeight) || DEFAULT_NODE_ROW_HEIGHT)
    },
    isHeaderSearch() {
      return (
        this.treeSetting.showSearch &&
        this.treeSetting.searchPlacement === X_TREE_SEARCH_PLACEMENTS.HEADER
      )
    },
    hasSearchToggle() {
      return this.treeSetting.showSearch && !this.isHeaderSearch
    },
    isPanelSearchVisible() {
      return this.hasSearchToggle && this.searchVisible
    },
    hasTreeMenuOperations() {
      return this.treeSetting.showCollapse || this.treeSetting.showRefresh
    },
    hasTreeMenu() {
      return (
        this.hasTreeMenuOperations ||
        this.treeSetting.showAssetScope ||
        Boolean(this.$slots['tools-menu'])
      )
    },
    hasTreeTools() {
      return (
        Boolean(this.$slots['toolbar-prepend']) || this.treeSetting.showSearch || this.hasTreeMenu
      )
    },
    defaultMenu() {
      return [
        {
          id: 'm_create',
          name: this.$t('CreateNode'),
          icon: 'fa-plus-square-o',
          callback: this.createTreeNode,
          has: () => this.treeSetting.showCreate
        },
        {
          id: 'm_edit',
          name: this.$t('RenameNode'),
          icon: 'fa-pencil-square-o',
          callback: this.startRename,
          has: () => this.treeSetting.showUpdate
        },
        {
          id: 'm_del',
          name: this.$t('DeleteNode'),
          icon: 'fa-minus-square',
          callback: this.removeTreeNode,
          has: () => this.treeSetting.showDelete
        }
      ]
    },
    menu() {
      const items = this.treeSetting.showDefaultMenu ? [...this.defaultMenu] : []
      return items.concat(this.treeSetting.menu || [])
    },
    canMove() {
      return (
        !this.treeSetting.readOnly &&
        !this.searchMode &&
        this.treeSetting.edit?.drag?.isMove !== false
      )
    },
    useVirtualTree() {
      return (
        this.treeSetting.virtualize !== false &&
        (!this.searchMode || this.treeSetting.virtualizeSearch !== false) &&
        (this.searchMode || !this.treeSetting.showAssets) &&
        this.treeNodeCount >= this.treeSetting.virtualThreshold
      )
    },
    initialExpandedKeys() {
      if (!this.treeData.length) {
        return []
      }
      if (!this.searchMode) {
        const configuredKeys =
          typeof this.treeSetting.initialExpandedKeys === 'function'
            ? this.treeSetting.initialExpandedKeys({ nodes: this.treeData, tree: this })
            : this.treeSetting.initialExpandedKeys
        if (Array.isArray(configuredKeys)) {
          return [...configuredKeys]
        }
        if (
          this.$store.getters.currentOrgIsRoot &&
          this.treeSetting.expandRootInGlobalOrg !== true
        ) {
          return []
        }
        const keys = this.treeData.filter((node) => node.open).map((node) => node.id)
        return keys.length ? keys : [this.treeData[0].id]
      }
      const keys = []
      const stack = [...this.treeData]
      while (stack.length) {
        const node = stack.pop()
        if (node.children?.length) {
          keys.push(node.id)
          stack.push(...node.children)
        }
      }
      return keys
    },
    menuStyle() {
      return {
        left: `${this.menuPosition.x}px`,
        top: `${this.menuPosition.y}px`
      }
    }
  },
  created() {
    this.debouncedSearch = _.debounce(this.searchTree, 200)
  },
  mounted() {
    this.setupRuntimeEffects()
    this.loadRoot()
  },
  activated() {
    this.setupRuntimeEffects()
  },
  deactivated() {
    this.teardownRuntimeEffects({ preserveAmountRefresh: true })
  },
  beforeUnmount() {
    this.teardownRuntimeEffects()
    this.debouncedSearch?.cancel()
    this.searchAbortController?.abort()
    this.structureAbortController?.abort()
    this.childrenAbortControllers.forEach((controller) => controller.abort())
    this.childrenAbortControllers.clear()
    this.removeDragPreview()
  },
  methods: {
    getDataSourcePayload(operation, payload = {}) {
      const basePayload = {
        operation,
        ...payload,
        tree: this
      }
      const source = this.treeSetting.dataSourceContext
      const context = typeof source === 'function' ? source(basePayload) : source
      return {
        ...(context || {}),
        ...basePayload
      }
    },
    loadFromDataSource(operation, payload = {}) {
      const loader = this.treeSetting.dataSource?.[operation]
      if (typeof loader !== 'function') {
        return undefined
      }
      return loader(this.getDataSourcePayload(operation, payload))
    },
    setupRuntimeEffects() {
      if (this.runtimeEffectsActive) {
        return
      }
      this.runtimeEffectsActive = true
      const generation = ++this.runtimeEffectsGeneration
      document.addEventListener('mousedown', this.hideRMenu)
      document.addEventListener('keydown', this.handleContextMenuKeydown, true)
      document.addEventListener('scroll', this.hideRMenu, true)
      document.addEventListener('scroll', this.handleDocumentAmountScroll, true)
      this.setupTreeResizeObserver(generation)
      this.$nextTick(() => {
        if (this.isRuntimeEffectsCurrent(generation) && this.treeData.length) {
          this.rebuildProgressiveAmountWindow()
        }
      })
    },
    teardownRuntimeEffects({ preserveAmountRefresh = false } = {}) {
      this.runtimeEffectsActive = false
      this.runtimeEffectsGeneration += 1
      this.hideRMenu()
      document.removeEventListener('mousedown', this.hideRMenu)
      document.removeEventListener('keydown', this.handleContextMenuKeydown, true)
      document.removeEventListener('scroll', this.hideRMenu, true)
      document.removeEventListener('scroll', this.handleDocumentAmountScroll, true)
      this.treeResizeObserver?.disconnect()
      this.treeResizeObserver = null
      window.cancelAnimationFrame(this.treeResizeFrame)
      window.cancelAnimationFrame(this.searchFocusFrame)
      this.treeResizeFrame = null
      this.searchFocusFrame = null
      this.cancelAmountLoading({ preserveFresh: preserveAmountRefresh })
    },
    isRuntimeEffectsCurrent(generation) {
      return this.runtimeEffectsActive && generation === this.runtimeEffectsGeneration
    },
    setupTreeResizeObserver(generation = this.runtimeEffectsGeneration) {
      const updateHeight = () => {
        if (!this.isRuntimeEffectsCurrent(generation)) {
          return
        }
        window.cancelAnimationFrame(this.treeResizeFrame)
        this.treeResizeFrame = window.requestAnimationFrame(() => {
          this.treeResizeFrame = null
          if (!this.isRuntimeEffectsCurrent(generation)) {
            return
          }
          const height = this.$refs.treeViewport?.clientHeight || 0
          if (!height) {
            return
          }
          const nextHeight = Math.max(1, Math.round(height))
          if (nextHeight !== this.virtualTreeHeight) {
            this.virtualTreeHeight = nextHeight
          }
        })
      }
      this.$nextTick(() => {
        if (this.isRuntimeEffectsCurrent(generation)) {
          updateHeight()
        }
      })
      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(updateHeight)
        this.treeResizeObserver = observer
        this.$nextTick(() => {
          if (
            this.isRuntimeEffectsCurrent(generation) &&
            this.treeResizeObserver === observer &&
            this.$refs.treeBody
          ) {
            observer.observe(this.$refs.treeBody)
          }
        })
      }
    },
    yieldToBrowser() {
      return new Promise((resolve) => {
        if (typeof window.requestIdleCallback === 'function') {
          window.requestIdleCallback(resolve, { timeout: 32 })
        } else {
          window.setTimeout(resolve, 0)
        }
      })
    },
    getNodeKey(node) {
      if (typeof this.treeSetting.getNodeKey === 'function') {
        return this.treeSetting.getNodeKey(node)
      }
      return node?.meta?.data?.key ?? node?.id
    },
    getParentKey(node) {
      return node?.pId ?? node?.parent_key ?? node?.meta?.data?.parent_key
    },
    getRawNodeLabel(node) {
      return node?.name || node?.meta?.data?.value || ''
    },
    getNodeLabel(node) {
      if (typeof this.treeSetting.getNodeLabel === 'function') {
        return this.treeSetting.getNodeLabel(node)
      }
      return this.getRawNodeLabel(node)
    },
    getNodeTitle(node) {
      const label = this.getNodeLabel(node)
      const amount = this.getNodeAmount(node)
      return Number.isFinite(amount) ? `${label} (${amount})` : label
    },
    getNodeAmountTitle(node) {
      if (typeof this.treeSetting.getNodeAmountTitle === 'function') {
        return this.treeSetting.getNodeAmountTitle(node, this.getNodeAmount(node))
      }
      return ''
    },
    isLeafNode(node) {
      if (typeof this.treeSetting.isLeaf === 'function') {
        return Boolean(this.treeSetting.isLeaf(node))
      }
      return Boolean(node?._isLeaf)
    },
    isNodeDisabled(node) {
      if (typeof this.treeSetting.isNodeDisabled === 'function') {
        return Boolean(this.treeSetting.isNodeDisabled(node))
      }
      return Boolean(node?.disabled || node?.chkDisabled || node?.valid === false)
    },
    isNodeSelectable(node) {
      if (typeof this.treeSetting.selectPredicate === 'function') {
        return Boolean(this.treeSetting.selectPredicate(node))
      }
      return true
    },
    isNodeChildrenProjection(node) {
      if (typeof this.treeSetting.childrenProjectionPredicate === 'function') {
        return Boolean(this.treeSetting.childrenProjectionPredicate(node))
      }
      return Boolean(node?._childrenProjection)
    },
    getNodeAmountKey(node) {
      if (typeof this.treeSetting.getAmountKey === 'function') {
        const key = this.treeSetting.getAmountKey(node)
        return key === undefined || key === null ? '' : String(key)
      }
      const nodeId =
        typeof node === 'string' || typeof node === 'number'
          ? node
          : (node?.meta?.data?.id ?? node?.id)
      return nodeId === undefined || nodeId === null ? '' : String(nodeId)
    },
    getNodeAmountResourceId(node) {
      if (typeof this.treeSetting.getNodeAmountResourceId === 'function') {
        return this.treeSetting.getNodeAmountResourceId(node)
      }
      return node?.meta?.data?.id ?? node?.id
    },
    getAmountResultKey(item) {
      if (typeof this.treeSetting.getAmountResultKey === 'function') {
        const key = this.treeSetting.getAmountResultKey(item)
        return key === undefined || key === null ? '' : String(key)
      }
      const id = item?.id ?? item?.node_id ?? item?.resource_id
      return id === undefined || id === null ? '' : String(id)
    },
    getNodeAmount(node) {
      const key = this.getNodeAmountKey(node)
      return key ? this.nodeAmounts.get(key) : undefined
    },
    shouldHandleNodeAmount(node) {
      const predicate = this.treeSetting.amountPredicate || this.treeSetting.showAmount
      if (typeof predicate === 'function') {
        return Boolean(predicate(node))
      }
      const amountTypes = Array.isArray(this.treeSetting.amountTypes)
        ? this.treeSetting.amountTypes
        : ['node']
      return amountTypes.includes(node?.meta?.type)
    },
    hasNodeAmount(node) {
      return this.shouldHandleNodeAmount(node) && Number.isFinite(this.getNodeAmount(node))
    },
    setNodeAmount(node, amount) {
      const key = this.getNodeAmountKey(node)
      if (!key) {
        return
      }
      if (Number.isFinite(amount)) {
        this.nodeAmounts.set(key, amount)
        if (this.localFilterMode && this.normalNodeAmounts) {
          this.normalNodeAmounts.set(key, amount)
        }
      } else {
        this.nodeAmounts.delete(key)
        if (this.localFilterMode && this.normalNodeAmounts) {
          this.normalNodeAmounts.delete(key)
        }
      }
    },
    setNodeMetric(id, amount) {
      const visibleNode = this.findTreeNodeIn(this.treeData, id)
      const normalNode = this.findTreeNodeIn(this.normalTreeData, id)
      const nodes = [visibleNode, normalNode].filter(Boolean)
      const uniqueNodes = [...new Set(nodes)]
      uniqueNodes.forEach((node) => this.setNodeAmount(node, amount))

      const normalKey = normalNode ? this.getNodeAmountKey(normalNode) : ''
      if (normalKey && this.normalNodeAmounts) {
        if (Number.isFinite(amount)) {
          this.normalNodeAmounts.set(normalKey, amount)
        } else {
          this.normalNodeAmounts.delete(normalKey)
        }
      }
      return uniqueNodes.length > 0
    },
    collectInitialNodeAmounts(nodes) {
      const amounts = new Map()
      const stack = [...nodes]
      while (stack.length) {
        const node = stack.pop()
        if (this.shouldHandleNodeAmount(node)) {
          const amount = node.assets_amount ?? node.meta?.data?.assets_amount
          const key = this.getNodeAmountKey(node)
          if (key && Number.isFinite(amount)) {
            amounts.set(key, Number(amount))
          }
        }
        delete node.assets_amount
        if (node.children?.length) {
          stack.push(...node.children)
        }
      }
      if (String(this.treeSetting.initialAssetScope) === String(this.assetScope)) {
        const initialAmounts = this.treeSetting.initialAmounts
        const entries =
          initialAmounts instanceof Map ? initialAmounts : Object.entries(initialAmounts || {})
        for (const [key, amount] of entries) {
          const value = Number(amount)
          if (Number.isFinite(value)) {
            amounts.set(String(key), value)
          }
        }
      }
      return amounts
    },
    initializeNodeAmounts(nodes) {
      this.nodeAmounts = this.collectInitialNodeAmounts(nodes)
    },
    normalizeNode(node, children = []) {
      const type = node.meta?.type
      const hasChildren = node.hasChildren ?? node.meta?.data?.has_children
      const amount = node.assets_amount ?? node.meta?.data?.assets_amount
      const isLeaf =
        children.length === 0 &&
        (hasChildren === false ||
          node.isParent === false ||
          type === 'asset' ||
          type === 'platform')
      return {
        ...node,
        id: this.getNodeKey(node),
        name: this.getRawNodeLabel(node),
        children,
        assets_amount: amount === undefined || amount === null ? null : Number(amount),
        _isLeaf: isLeaf
      }
    },
    getResponseNodes(response) {
      return Array.isArray(response) ? response : response?.results || response?.tree || []
    },
    flattenRawNodes(nodes) {
      const entries = []
      const stack = []
      for (let index = nodes.length - 1; index >= 0; index -= 1) {
        stack.push({ raw: nodes[index], inheritedParentKey: undefined })
      }
      while (stack.length) {
        const entry = stack.pop()
        const raw = entry.raw
        const children = raw.children || []
        const explicitParentKey = this.getParentKey(raw)
        entries.push({
          raw,
          parentKey:
            explicitParentKey === undefined || explicitParentKey === null
              ? entry.inheritedParentKey
              : explicitParentKey
        })
        const parentKey = this.getNodeKey(raw)
        for (let index = children.length - 1; index >= 0; index -= 1) {
          stack.push({ raw: children[index], inheritedParentKey: parentKey })
        }
      }
      return entries
    },
    buildTreeFromEntries(entries) {
      const normalized = entries.map(({ raw, parentKey }) => ({
        ...this.normalizeNode(raw),
        _treeParentKey: parentKey
      }))
      return this.linkNormalizedNodes(normalized)
    },
    linkNormalizedNodes(normalized) {
      const nodeMap = new Map()
      normalized.forEach((node) => nodeMap.set(String(node.id), node))
      const roots = []
      normalized.forEach((node) => {
        const parent = nodeMap.get(String(node._treeParentKey))
        delete node._treeParentKey
        if (parent && parent !== node) {
          parent.children.push(node)
          parent._isLeaf = false
        } else {
          roots.push(node)
        }
      })
      return roots
    },
    normalizeTree(response) {
      const entries = this.flattenRawNodes(this.getResponseNodes(response))
      return this.buildTreeFromEntries(entries)
    },
    async normalizeTreeAsync(response, isCurrent = () => true) {
      const entries = this.flattenRawNodes(this.getResponseNodes(response))
      if (entries.length < 2000) {
        return { roots: this.buildTreeFromEntries(entries), count: entries.length }
      }

      const normalized = []
      const chunkSize = 2000
      for (let offset = 0; offset < entries.length; offset += chunkSize) {
        if (!isCurrent()) {
          return null
        }
        const chunk = entries.slice(offset, offset + chunkSize)
        chunk.forEach(({ raw, parentKey }) => {
          normalized.push({ ...this.normalizeNode(raw), _treeParentKey: parentKey })
        })
        await this.yieldToBrowser()
      }

      const nodeMap = new Map()
      for (let offset = 0; offset < normalized.length; offset += chunkSize) {
        if (!isCurrent()) {
          return null
        }
        normalized
          .slice(offset, offset + chunkSize)
          .forEach((node) => nodeMap.set(String(node.id), node))
        await this.yieldToBrowser()
      }

      const roots = []
      for (let offset = 0; offset < normalized.length; offset += chunkSize) {
        if (!isCurrent()) {
          return null
        }
        normalized.slice(offset, offset + chunkSize).forEach((node) => {
          const parent = nodeMap.get(String(node._treeParentKey))
          delete node._treeParentKey
          if (parent && parent !== node) {
            parent.children.push(node)
            parent._isLeaf = false
          } else {
            roots.push(node)
          }
        })
        await this.yieldToBrowser()
      }
      return { roots, count: normalized.length }
    },
    cancelAmountLoading({ preserveFresh = false } = {}) {
      this.cancelAmountScrollFrame()
      this.amountRequestId += 1
      this.amountAbortController?.abort()
      this.amountAbortController = null
      this.amountQueue = []
      this.amountQueuedIds.clear()
      if (!preserveFresh) {
        this.freshAmountNodeIds.clear()
        this.nextAmountBatchFresh = false
      }
      this.amountWorkerRunning = false
    },
    clearNodeAmounts() {
      this.nodeAmounts.clear()
    },
    clearNormalNodeAmounts() {
      // Search renders an isolated amount map and keeps the normal tree's map
      // as a restore snapshot. Any scope/relation mutation must invalidate
      // that snapshot too, otherwise clearing search resurrects finite but
      // stale values that the progressive loader intentionally skips.
      this.normalNodeAmounts?.clear()
    },
    invalidateNormalMetrics() {
      this.clearNormalNodeAmounts()
    },
    hasNodeAmountLoader() {
      return Boolean(
        this.treeSetting.countUrl ||
        typeof this.treeSetting.loadNodeAmounts === 'function' ||
        typeof this.treeSetting.dataSource?.metrics === 'function'
      )
    },
    reloadVisibleNodeAmounts(options = {}) {
      const normalizedOptions = typeof options === 'boolean' ? { fresh: options } : options || {}
      if (normalizedOptions.resetNormal && this.normalNodeAmounts) {
        this.clearNormalNodeAmounts()
      }
      this.cancelAmountLoading()
      this.clearNodeAmounts()
      this.startProgressiveAmountLoading(Boolean(normalizedOptions.fresh))
    },
    reloadVisibleMetrics(options = {}) {
      return this.reloadVisibleNodeAmounts(options)
    },
    resetProgressiveAmountLoading() {
      this.amountLoadedRowEnd = 0
      this.amountAllRowsScheduled = false
    },
    collectExpandedTreeRows(roots, limit = Number.POSITIVE_INFINITY) {
      const rows = []
      const stack = [{ index: 0, nodes: roots }]
      while (stack.length) {
        const frame = stack[stack.length - 1]
        if (frame.index >= frame.nodes.length) {
          stack.pop()
          continue
        }
        const node = frame.nodes[frame.index]
        frame.index += 1
        rows.push(node)
        if (rows.length >= limit) {
          break
        }
        if (!this.expandedNodeIds.has(String(node.id)) || !node.children?.length) {
          continue
        }
        stack.push({ index: 0, nodes: node.children })
      }
      return rows
    },
    getTreeAmountScrollElement() {
      const treeBody = this.$refs.treeBody
      if (!treeBody) {
        return null
      }
      if (this.useVirtualTree) {
        return treeBody.querySelector('.el-tree-virtual-list') || treeBody
      }
      return this.$refs.treeViewport || treeBody
    },
    handleTreeWheelCapture(event) {
      if (this.useVirtualTree) {
        event.stopPropagation()
      }
    },
    getProgressiveAmountBatchSize() {
      return Math.max(1, Number(this.treeSetting.countProgressiveBatchSize) || 100)
    },
    collectProgressiveAmountNodes(startIndex, endIndex) {
      return this.collectExpandedTreeRows(this.treeData, endIndex).slice(startIndex, endIndex)
    },
    getTreeAmountScrollIndex(scrollElement = this.getTreeAmountScrollElement()) {
      const rowHeight = this.nodeRowHeight
      const internalScrollTop = Math.max(0, Number(scrollElement?.scrollTop) || 0)
      const hasInternalOverflow =
        Number(scrollElement?.scrollHeight) > Number(scrollElement?.clientHeight) + 1
      if (internalScrollTop > 0 || hasInternalOverflow) {
        return Math.floor(internalScrollTop / rowHeight)
      }
      // Some TreeTable pages grow with their content instead of making the
      // tree body the scroll container. In that layout scrollTop is always 0;
      // derive the first visible row from the body's viewport position.
      const bodyTop = scrollElement?.getBoundingClientRect?.().top
      const scrollTop = Number.isFinite(bodyTop) ? Math.max(0, -bodyTop) : 0
      return Math.floor(scrollTop / rowHeight)
    },
    rebuildProgressiveAmountWindow() {
      if (!this.runtimeEffectsActive || !this.hasNodeAmountLoader()) {
        return
      }
      const scrollElement = this.getTreeAmountScrollElement()
      const batchSize = this.getProgressiveAmountBatchSize()
      const firstVisibleIndex = this.getTreeAmountScrollIndex(scrollElement)
      // Rebase to the batch containing the first visible row. Never use the
      // body's clientHeight here: on auto-height pages it is the full rendered
      // tree height and would enqueue thousands of off-screen siblings.
      const windowEnd = Math.max(
        batchSize,
        Math.ceil((firstVisibleIndex + 1) / batchSize) * batchSize
      )
      const windowNodes = this.collectProgressiveAmountNodes(0, windowEnd + 1)
      const nodes = windowNodes.slice(0, windowEnd)
      const pendingFreshNodeIds = new Set(this.freshAmountNodeIds)
      const refreshWindow = this.nextAmountBatchFresh

      this.cancelAmountLoading()
      this.resetProgressiveAmountLoading()
      this.amountLoadedRowEnd = nodes.length
      this.amountAllRowsScheduled = windowNodes.length <= windowEnd
      // Expanding while an explicit refresh batch is in flight must not turn
      // its retried request back into an ordinary cacheable read.
      nodes.forEach((node) => {
        const nodeId = this.getNodeAmountResourceId(node)
        if (!nodeId || !this.shouldHandleNodeAmount(node)) {
          return
        }
        if (refreshWindow) {
          this.setNodeAmount(node, null)
          this.freshAmountNodeIds.add(String(nodeId))
        } else if (pendingFreshNodeIds.has(String(nodeId))) {
          this.freshAmountNodeIds.add(String(nodeId))
        }
      })
      this.enqueueNodeAmounts(nodes)
    },
    enqueueDirectChildAmounts(children) {
      const batchSize = this.getProgressiveAmountBatchSize()
      const directChildren = (children || []).filter((node) => this.shouldHandleNodeAmount(node))
      const firstBatch = directChildren.slice(0, batchSize)
      if (!firstBatch.length) {
        return
      }
      this.enqueueNodeAmounts(firstBatch)

      // Inserted children shift the flattened row indexes. Move the scheduled
      // boundary to the last direct child in this first batch so the ordinary
      // scroll trigger loads the next 100 only after half of this batch has
      // passed through the viewport.
      const rows = this.collectExpandedTreeRows(this.treeData)
      const lastChildKey = this.getNodeAmountKey(firstBatch.at(-1))
      const lastChildIndex = rows.findIndex((node) => this.getNodeAmountKey(node) === lastChildKey)
      if (lastChildIndex >= 0) {
        this.amountLoadedRowEnd = Math.max(this.amountLoadedRowEnd, lastChildIndex + 1)
        this.amountAllRowsScheduled = rows.length <= this.amountLoadedRowEnd
      }
    },
    async requestNodeAmounts(nodes, signal) {
      const nodeIds = nodes.map((node) => this.getNodeAmountResourceId(node)).filter(Boolean)
      if (!nodeIds.length) {
        return { results: [] }
      }
      const includeDescendants = this.assetScope !== '1'
      const fresh = nodeIds.some((nodeId) => this.freshAmountNodeIds.has(String(nodeId)))
      if (typeof this.treeSetting.loadNodeAmounts === 'function') {
        return this.treeSetting.loadNodeAmounts(nodeIds, {
          fresh,
          includeDescendants,
          nodes,
          signal
        })
      }
      if (typeof this.treeSetting.dataSource?.metrics === 'function') {
        return this.loadFromDataSource('metrics', {
          fresh,
          includeDescendants,
          nodeIds,
          nodes,
          signal
        })
      }
      return this.$axios.post(
        this.treeSetting.countUrl,
        { fresh, include_descendants: includeDescendants, node_ids: nodeIds },
        { signal }
      )
    },
    enqueueNodeAmounts(nodes) {
      if (!this.runtimeEffectsActive || !this.hasNodeAmountLoader()) {
        return
      }
      nodes.forEach((node) => {
        const queueKey = this.getNodeAmountKey(node)
        if (
          !queueKey ||
          !this.shouldHandleNodeAmount(node) ||
          Number.isFinite(this.getNodeAmount(node)) ||
          this.amountQueuedIds.has(queueKey)
        ) {
          return
        }
        this.amountQueuedIds.add(queueKey)
        this.amountQueue.push(node)
      })
      if (this.amountQueue.length && !this.amountWorkerRunning) {
        this.processAmountQueue()
      }
    },
    enqueueNextProgressiveAmountBatch() {
      if (this.amountAllRowsScheduled || !this.hasNodeAmountLoader()) {
        return
      }
      const batchSize = this.getProgressiveAmountBatchSize()
      const startIndex = this.amountLoadedRowEnd
      const endIndex = startIndex + batchSize
      const nodes = this.collectProgressiveAmountNodes(startIndex, endIndex)
      if (!nodes.length) {
        this.amountAllRowsScheduled = true
        return
      }
      this.amountLoadedRowEnd = startIndex + nodes.length
      this.amountAllRowsScheduled = nodes.length < batchSize
      if (this.nextAmountBatchFresh) {
        nodes.forEach((node) => {
          if (!this.shouldHandleNodeAmount(node)) {
            return
          }
          this.setNodeAmount(node, null)
          const resourceId = this.getNodeAmountResourceId(node)
          if (resourceId) {
            this.freshAmountNodeIds.add(String(resourceId))
          }
        })
        this.nextAmountBatchFresh = false
      }
      this.enqueueNodeAmounts(nodes)
    },
    startProgressiveAmountLoading(fresh = false) {
      if (!this.runtimeEffectsActive) {
        this.nextAmountBatchFresh ||= Boolean(fresh)
        return
      }
      this.resetProgressiveAmountLoading()
      this.nextAmountBatchFresh = Boolean(fresh)
      this.enqueueNextProgressiveAmountBatch()
    },
    maybeEnqueueNextProgressiveAmountBatch(scrollElement) {
      if (
        this.amountAllRowsScheduled ||
        this.amountLoadedRowEnd === 0 ||
        this.amountWorkerRunning ||
        this.amountQueue.length
      ) {
        return
      }
      const batchSize = this.getProgressiveAmountBatchSize()
      const triggerIndex = Math.max(0, this.amountLoadedRowEnd - Math.ceil(batchSize / 2))
      if (this.getTreeAmountScrollIndex(scrollElement) >= triggerIndex) {
        this.enqueueNextProgressiveAmountBatch()
      }
    },
    cancelAmountScrollFrame() {
      if (this.amountScrollFrame === null) {
        return
      }
      window.cancelAnimationFrame(this.amountScrollFrame)
      this.amountScrollFrame = null
    },
    scheduleProgressiveAmountLoading(scrollElement) {
      if (!this.runtimeEffectsActive || this.amountScrollFrame !== null) {
        return
      }
      this.amountScrollFrame = window.requestAnimationFrame(() => {
        this.amountScrollFrame = null
        this.maybeEnqueueNextProgressiveAmountBatch(
          scrollElement || this.getTreeAmountScrollElement()
        )
      })
    },
    handleTreeAmountScroll(event) {
      this.scheduleProgressiveAmountLoading(event.target)
    },
    handleDocumentAmountScroll(event) {
      const scrollElement = this.getTreeAmountScrollElement()
      if (!scrollElement || event.target === scrollElement) {
        return
      }
      const rect = scrollElement.getBoundingClientRect()
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
        return
      }
      this.scheduleProgressiveAmountLoading(scrollElement)
    },
    refreshNodeAmounts(nodes) {
      if (this.assetScope === '1') {
        return
      }
      this.forceRefreshNodeAmounts(nodes)
    },
    forceRefreshNodeAmounts(nodes) {
      const uniqueNodes = []
      const nodeKeys = new Set()
      nodes.forEach((node) => {
        const key = this.getNodeAmountKey(node)
        if (!key || nodeKeys.has(key)) {
          return
        }
        nodeKeys.add(key)
        uniqueNodes.push(node)
      })
      if (!uniqueNodes.length) {
        return
      }

      if (this.searchMode) {
        // Callers may provide only a changed leaf and not all affected
        // ancestors. Clearing the bounded snapshot is conservative and keeps
        // restoration correct; visible rows are progressively reloaded.
        this.clearNormalNodeAmounts()
      }

      const pendingLoadedNodes = this.collectProgressiveAmountNodes(
        0,
        this.amountLoadedRowEnd
      ).filter((node) => !Number.isFinite(this.getNodeAmount(node)))
      this.cancelAmountLoading()
      uniqueNodes.forEach((node) => {
        this.setNodeAmount(node, null)
        const nodeId = this.getNodeAmountResourceId(node)
        if (nodeId) {
          this.freshAmountNodeIds.add(String(nodeId))
        }
      })
      this.enqueueNodeAmounts([...uniqueNodes, ...pendingLoadedNodes])
    },
    refreshAssetRelationAmounts(affectedNodeIds) {
      const affectedIds = new Set((affectedNodeIds || []).map(String))
      if (!affectedIds.size) {
        return
      }

      const matchedWithAncestors = []
      const visited = new Set()
      const stack = this.normalTreeData.map((node) => ({ node, ancestors: [] }))
      while (stack.length) {
        const { node, ancestors } = stack.pop()
        const nodeId = this.getNodeAmountResourceId(node)
        if (nodeId && affectedIds.has(String(nodeId))) {
          for (const item of [...ancestors, node]) {
            const key = this.getNodeAmountKey(item)
            if (key && !visited.has(key)) {
              visited.add(key)
              matchedWithAncestors.push(item)
            }
          }
        }
        const nextAncestors = [...ancestors, node]
        for (const child of node.children || []) {
          stack.push({ node: child, ancestors: nextAncestors })
        }
      }

      this.forceRefreshNodeAmounts(matchedWithAncestors)
    },
    async processAmountQueue() {
      if (!this.runtimeEffectsActive || this.amountWorkerRunning) {
        return
      }
      this.amountWorkerRunning = true
      const requestId = this.amountRequestId
      const controller = new AbortController()
      this.amountAbortController = controller
      const batchSize = Math.min(200, Math.max(1, Number(this.treeSetting.countBatchSize) || 100))

      try {
        while (this.amountQueue.length) {
          if (requestId !== this.amountRequestId) {
            return
          }
          await this.yieldToBrowser()
          if (requestId !== this.amountRequestId) {
            return
          }
          const batch = this.amountQueue.splice(0, batchSize)
          if (!batch.length) {
            continue
          }
          const response = await this.requestNodeAmounts(batch, controller.signal)
          if (requestId !== this.amountRequestId) {
            return
          }
          const results = Array.isArray(response) ? response : response?.results || []
          const amountMap = new Map(
            results.map((item) => [
              this.getAmountResultKey(item),
              Number(item.assets_amount ?? item.amount ?? item.count ?? item.value)
            ])
          )
          batch.forEach((node) => {
            const nodeId = String(this.getNodeAmountResourceId(node))
            const amountKey = this.getNodeAmountKey(node)
            const amount = amountMap.get(amountKey) ?? amountMap.get(nodeId)
            if (Number.isFinite(amount)) {
              this.setNodeAmount(node, amount)
            }
            this.amountQueuedIds.delete(amountKey)
            this.freshAmountNodeIds.delete(nodeId)
          })
        }
      } catch (error) {
        if (requestId !== this.amountRequestId) {
          return
        }
        if (error?.code !== 'ERR_CANCELED' && error?.name !== 'AbortError') {
          this.$log?.warn?.('Load tree node amounts failed', error)
        }
        this.amountQueue = []
        this.amountQueuedIds.clear()
        this.freshAmountNodeIds.clear()
      } finally {
        if (requestId === this.amountRequestId) {
          this.amountAbortController = null
          this.amountWorkerRunning = false
          if (this.amountQueue.length) {
            this.processAmountQueue()
          } else {
            this.scheduleProgressiveAmountLoading()
          }
        }
      }
    },
    async requestTree(url, params = {}, options = {}) {
      return this.$axios.get(url, {
        params,
        signal: options.signal,
        'axios-retry': {
          retries: 20,
          retryCondition: (error) =>
            axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 409,
          shouldResetTimeout: true,
          retryDelay: () => 5000
        }
      })
    },
    getRefreshUrl(refresh) {
      const url = this.treeSetting.structureUrl || this.treeSetting.treeUrl || ''
      if (refresh && url.includes('/perms/') && !url.includes('rebuild_tree')) {
        return appendUrlParam(url, 'rebuild_tree', 1)
      }
      return url
    },
    reconcileExpandedSnapshot(roots, source) {
      if (!(source instanceof Set)) {
        return null
      }
      const knownKeys = new Set()
      const stack = [...roots]
      while (stack.length) {
        const node = stack.pop()
        knownKeys.add(String(node.id))
        if (node.children?.length) {
          stack.push(...node.children)
        }
      }
      return new Set([...source].filter((key) => knownKeys.has(String(key))))
    },
    async restoreDeferredNormalTree() {
      if (!this.normalTreeDeferredBySearch || this.searchMode) {
        return false
      }
      const restoredCurrentNode = this.currentNode
        ? this.findTreeNodeIn(this.normalTreeData, this.currentNode.id)
        : null
      const expandedKeys = this.normalExpandedNodeIds ? [...this.normalExpandedNodeIds] : null
      this.nodeAmounts = this.normalNodeAmounts || new Map()
      this.normalNodeAmounts = null
      this.treeData = this.normalTreeData
      this.treeNodeCount = this.normalTreeNodeCount
      this.normalTreeDeferredBySearch = false
      this.treeKey += 1
      await this.$nextTick()
      await this.expandInitialNodes(expandedKeys)
      this.currentNode = restoredCurrentNode
      this.$refs.tree?.setCurrentKey(restoredCurrentNode?.id ?? null)
      this.normalExpandedNodeIds = null
      return true
    },
    async loadRoot(refresh = false) {
      const requestId = ++this.structureRequestId
      const searchGenerationAtStart = this.searchRequestId
      const searchOwnedTreeAtStart = this.searchMode || this.searchLoading
      const previousNormalTreeHadNodes = this.normalTreeData.length > 0
      const previousExpandedSnapshot =
        this.normalExpandedNodeIds ??
        (!this.searchMode && (previousNormalTreeHadNodes || this.expandedNodeIds.size)
          ? new Set(this.expandedNodeIds)
          : null)
      this.structureAbortController?.abort()
      this.childrenAbortControllers.forEach((item) => item.abort())
      this.childrenAbortControllers.clear()
      const controller = new AbortController()
      this.structureAbortController = controller
      if (!searchOwnedTreeAtStart) {
        this.cancelAmountLoading()
        this.resetProgressiveAmountLoading()
      }
      const staticMode = this.treeSetting.loadMode === X_TREE_LOAD_MODES.STATIC
      const url = staticMode ? '' : this.getRefreshUrl(refresh)
      const initialData = staticMode
        ? this.treeSetting.initialData
        : refresh
          ? null
          : this.treeSetting.initialData
      const hasInitialData =
        initialData != null && (staticMode || !Array.isArray(initialData) || initialData.length > 0)
      const rootLoader = staticMode ? null : this.treeSetting.loadRoot
      const dataSourceRoot = staticMode ? null : this.treeSetting.dataSource?.root
      if (
        !url &&
        !hasInitialData &&
        typeof rootLoader !== 'function' &&
        typeof dataSourceRoot !== 'function'
      ) {
        this.structureAbortController = null
        this.structureLoading = false
        this.normalTreeData = []
        this.normalTreeNodeCount = 0
        if (this.searchMode || this.searchLoading) {
          this.normalNodeAmounts = new Map()
          this.normalExpandedNodeIds = null
          this.normalTreeDeferredBySearch = true
        } else {
          this.nodeAmounts.clear()
          this.treeData = []
          this.treeNodeCount = 0
          this.normalTreeDeferredBySearch = false
        }
        return
      }
      this.structureLoading = true
      try {
        const response = hasInitialData
          ? initialData
          : typeof rootLoader === 'function'
            ? await rootLoader({ refresh, signal: controller.signal, tree: this })
            : typeof dataSourceRoot === 'function'
              ? await this.loadFromDataSource('root', {
                  refresh,
                  signal: controller.signal
                })
              : await this.requestTree(url, {}, { signal: controller.signal })
        const normalized = await this.normalizeTreeAsync(
          response,
          () => requestId === this.structureRequestId
        )
        if (!normalized || requestId !== this.structureRequestId) {
          return
        }
        this.nodeChildrenViewSources.clear()
        const normalAmounts = this.collectInitialNodeAmounts(normalized.roots)
        this.normalTreeData = normalized.roots
        this.normalTreeNodeCount = normalized.count
        const searchGenerationChanged = this.searchRequestId !== searchGenerationAtStart
        const searchOwnsVisibleTree =
          (this.searchMode || this.searchLoading) &&
          (searchOwnedTreeAtStart || searchGenerationChanged)
        if (searchOwnsVisibleTree) {
          // Root and search requests deliberately run independently. Keep the
          // new normal structure/metrics as a restore snapshot, but never let
          // a slow root response replace (or clear amounts from) a pending or
          // already-visible search tree.
          this.normalNodeAmounts = normalAmounts
          this.normalExpandedNodeIds = this.reconcileExpandedSnapshot(
            normalized.roots,
            previousExpandedSnapshot
          )
          this.normalTreeDeferredBySearch = true
          this.$emit('tree-init-finish', this)
          return
        }
        this.nodeAmounts = normalAmounts
        this.treeData = this.normalTreeData
        this.treeNodeCount = normalized.count
        this.normalNodeAmounts = null
        this.normalExpandedNodeIds = null
        this.normalTreeDeferredBySearch = false
        this.searchMode = false
        this.treeKey += 1
        await this.$nextTick()
        await this.expandInitialNodes()
        this.$emit('tree-init-finish', this)
        this.startProgressiveAmountLoading(refresh)
      } catch (error) {
        if (
          requestId !== this.structureRequestId ||
          error?.code === 'ERR_CANCELED' ||
          error?.name === 'AbortError'
        ) {
          return
        }
        throw error
      } finally {
        if (requestId === this.structureRequestId) {
          this.structureAbortController = null
          this.structureLoading = false
        }
      }
    },
    async expandInitialNodes(expandedKeysOverride = null) {
      this.suppressExpandAmountLoading = true
      try {
        this.expandedNodeIds.clear()
        if (this.useVirtualTree) {
          const keys = expandedKeysOverride || this.initialExpandedKeys
          keys.forEach((key) => this.expandedNodeIds.add(String(key)))
          this.$refs.tree?.setExpandedKeys(keys)
          await this.revealOperationNode()
          return
        }
        if (this.searchMode) {
          const stack = [...this.treeData]
          while (stack.length) {
            const item = stack.pop()
            if (item.children?.length) {
              this.expandedNodeIds.add(String(item.id))
              this.$refs.tree?.getNode(item.id)?.expand()
              stack.push(...item.children)
            }
          }
          await this.revealOperationNode()
          return
        }
        const keys = expandedKeysOverride || this.initialExpandedKeys
        keys.forEach((key) => {
          this.expandedNodeIds.add(String(key))
          this.$refs.tree?.getNode(key)?.expand()
        })
        await this.revealOperationNode()
      } finally {
        await this.$nextTick()
        this.suppressExpandAmountLoading = false
      }
    },
    getOperationNodePath() {
      const operationNodeId = this.treeSetting.operationNodeId
      if (operationNodeId === undefined || operationNodeId === null || operationNodeId === '') {
        return []
      }

      const stack = this.normalTreeData.map((node) => ({ node, parent: null }))
      while (stack.length) {
        const entry = stack.pop()
        if (this.isOperationTarget(entry.node)) {
          const path = []
          let current = entry
          while (current) {
            path.unshift(current.node)
            current = current.parent
          }
          return path
        }
        for (const child of entry.node.children || []) {
          stack.push({ node: child, parent: entry })
        }
      }
      return []
    },
    async revealOperationNode() {
      const path = this.getOperationNodePath()
      if (!path.length) {
        return
      }

      const target = path.at(-1)
      path.slice(0, -1).forEach((node) => {
        this.expandedNodeIds.add(String(node.id))
        if (!this.useVirtualTree) {
          this.$refs.tree?.getNode(node.id)?.expand()
        }
      })

      if (this.useVirtualTree) {
        this.$refs.tree?.setExpandedKeys([...this.expandedNodeIds])
        await this.$nextTick()
        this.$refs.tree?.scrollToNode(target.id, 'center')
        return
      }

      await this.$nextTick()
      const container = this.getTreeAmountScrollElement()
      const element = container?.querySelector('.x-tree__node.is-operation-target')
      if (!container || !element) {
        return
      }
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      container.scrollTop +=
        elementRect.top - containerRect.top - (containerRect.height - elementRect.height) / 2
    },
    async loadNode(node, resolve, reject) {
      if (node.level === 0) {
        resolve(this.treeData)
        return
      }
      const reloadProjectedChildren = Boolean(
        this.isNodeChildrenProjection(node.data) && node.data?._reloadProjectedChildren
      )
      if ((node.data?.children?.length && !reloadProjectedChildren) || node.data?._isLeaf) {
        if (node.data?.children?.length) {
          this.rememberNodeChildrenViewSource(node.data, node.data.children)
        }
        resolve(node.data?.children || [])
        return
      }
      const requestKey = String(node.data.id)
      this.childrenAbortControllers.get(requestKey)?.abort()
      const controller = new AbortController()
      this.childrenAbortControllers.set(requestKey, controller)
      try {
        const childrenLoader = this.treeSetting.loadChildren
        const dataSourceChildren = this.treeSetting.dataSource?.children
        const response =
          typeof childrenLoader === 'function'
            ? await childrenLoader({
                level: node.level,
                parent: node.data,
                signal: controller.signal,
                tree: this
              })
            : typeof dataSourceChildren === 'function'
              ? await this.loadFromDataSource('children', {
                  level: node.level,
                  parent: node.data,
                  signal: controller.signal
                })
              : await this.requestTree(
                  this.treeSetting.treeUrl,
                  {
                    key: node.data.id,
                    n: node.data.name,
                    lv: node.level
                  },
                  { signal: controller.signal }
                )
        const children = this.normalizeTree(response)
        // Keep successfully loaded children on the data object. Besides
        // avoiding duplicate lazy requests, this lets an async search swap the
        // visible tree out and later restore the exact expanded structure.
        node.data.children = children
        node.data._childrenProjection = false
        node.data._reloadProjectedChildren = false
        node.data._isLeaf = children.length === 0
        this.rememberNodeChildrenViewSource(node.data, children, { replace: true })
        resolve(children)
        await this.$nextTick()
        if (
          children.length &&
          this.expandedNodeIds.has(String(node.data.id)) &&
          !this.suppressExpandAmountLoading
        ) {
          // Expanding a node owns only its direct children. Do not rebuild the
          // whole flattened window, which would also enqueue later siblings.
          this.enqueueDirectChildAmounts(children)
        }
      } catch {
        // Resolving an error as [] marks Element Plus' lazy node as loaded and
        // permanently prevents retries. reject() only clears its loading state;
        // it does not throw or surface an error when refresh/unmount aborts the
        // request, and a real network/5xx failure can be retried by expanding.
        if (typeof reject === 'function') {
          reject()
        } else {
          node.loading = false
        }
      } finally {
        if (this.childrenAbortControllers.get(requestKey) === controller) {
          this.childrenAbortControllers.delete(requestKey)
        }
      }
    },
    async handleNodeExpand(data) {
      if (data?.id !== undefined && data?.id !== null) {
        this.expandedNodeIds.add(String(data.id))
      }
      if (this.suppressExpandAmountLoading) {
        return
      }
      await this.$nextTick()
      this.enqueueDirectChildAmounts(data?.children)
    },
    async handleNodeCollapse(data) {
      if (data?.id !== undefined && data?.id !== null) {
        this.expandedNodeIds.delete(String(data.id))
      }
      if (this.searchMode && this.isNodeChildrenProjection(data)) {
        const node = this.$refs.tree?.getNode?.(data.id)
        if (node?.loaded) {
          data._reloadProjectedChildren = true
          node.loaded = false
        }
      }
      if (this.suppressExpandAmountLoading) {
        return
      }
      await this.$nextTick()
      this.rebuildProgressiveAmountWindow()
    },
    async collapseTreeStepwise() {
      const tree = this.$refs.tree
      if (!tree || this.treeData.length === 0) {
        return
      }
      if (this.expandedNodeIds.size === 0) {
        return
      }

      const firstLevelKeys = this.treeData
        .filter((node) => !this.isLeafNode(node))
        .map((node) => String(node.id))
      const firstLevelKeySet = new Set(firstLevelKeys)
      const isFirstLevelState =
        this.expandedNodeIds.size === firstLevelKeySet.size &&
        [...this.expandedNodeIds].every((key) => firstLevelKeySet.has(String(key)))
      const nextExpandedKeys = isFirstLevelState ? [] : firstLevelKeys

      this.suppressExpandAmountLoading = true
      try {
        this.expandedNodeIds = new Set(nextExpandedKeys)
        if (this.useVirtualTree) {
          tree.setExpandedKeys(nextExpandedKeys)
        } else {
          const renderedNodes = []
          const stack = [...(tree.store?.root?.childNodes || [])]
          while (stack.length) {
            const node = stack.pop()
            renderedNodes.push(node)
            if (node.childNodes?.length) {
              stack.push(...node.childNodes)
            }
          }
          renderedNodes.reverse().forEach((node) => node.collapse())
          if (nextExpandedKeys.length) {
            const nextExpandedKeySet = new Set(nextExpandedKeys)
            tree.store?.root?.childNodes.forEach((node) => {
              if (nextExpandedKeySet.has(String(node.data.id))) {
                node.expand()
              }
            })
          }
        }
        await this.$nextTick()
      } finally {
        this.suppressExpandAmountLoading = false
      }
      this.rebuildProgressiveAmountWindow()
    },
    filterNode(query, node) {
      return this.getNodeLabel(node).toLocaleLowerCase().includes(query.toLocaleLowerCase())
    },
    handleSearchInput(value) {
      this.debouncedSearch(value.trim())
    },
    handleTreeToolCommand(command) {
      if (command === 'collapse') {
        this.collapseTreeStepwise()
      } else if (command === 'refresh') {
        this.refresh()
      }
    },
    closeToolsDropdown() {
      this.$nextTick(() => this.$refs.toolsDropdown?.handleClose?.())
    },
    toggleSearch() {
      this.searchVisible = !this.searchVisible
      if (!this.searchVisible) {
        this.searchValue = ''
        this.debouncedSearch.cancel()
        this.searchTree('')
        return
      }
      this.focusSearchInput()
    },
    focusSearchInput() {
      const generation = this.runtimeEffectsGeneration
      this.$nextTick(() => {
        if (!this.isRuntimeEffectsCurrent(generation)) {
          return
        }
        window.cancelAnimationFrame(this.searchFocusFrame)
        this.searchFocusFrame = window.requestAnimationFrame(() => {
          this.searchFocusFrame = null
          if (!this.isRuntimeEffectsCurrent(generation)) {
            return
          }
          const input = this.$refs.searchInput
          input?.focus?.()
          const nativeInput = input?.input || input?.$el?.querySelector?.('input')
          nativeInput?.focus?.({ preventScroll: true })
        })
      })
    },
    async filterTreeByPredicate(matches, isCurrent) {
      const entries = []
      const stack = []
      const chunkSize = 2000
      for (let index = this.normalTreeData.length - 1; index >= 0; index -= 1) {
        stack.push({ node: this.normalTreeData[index], parentIndex: -1 })
      }

      while (stack.length) {
        const { node, parentIndex } = stack.pop()
        const entryIndex = entries.length
        entries.push({
          matches: Boolean(matches(node)),
          node,
          parentIndex
        })
        const children = node.children || []
        for (let index = children.length - 1; index >= 0; index -= 1) {
          stack.push({ node: children[index], parentIndex: entryIndex })
        }
        if (entries.length % chunkSize === 0) {
          await this.yieldToBrowser()
          if (!isCurrent()) {
            return null
          }
        }
      }

      const visibleIndexes = new Set()
      for (let index = 0; index < entries.length; index += 1) {
        if (entries[index].matches) {
          let cursor = index
          while (cursor >= 0 && !visibleIndexes.has(cursor)) {
            visibleIndexes.add(cursor)
            cursor = entries[cursor].parentIndex
          }
        }
        if ((index + 1) % chunkSize === 0) {
          await this.yieldToBrowser()
          if (!isCurrent()) {
            return null
          }
        }
      }

      const clones = new Map()
      const roots = []
      for (let index = 0; index < entries.length; index += 1) {
        if (!visibleIndexes.has(index)) {
          continue
        }
        const entry = entries[index]
        const clone = {
          ...entry.node,
          children: []
        }
        clones.set(index, clone)
        const parent = clones.get(entry.parentIndex)
        if (parent) {
          parent.children.push(clone)
        } else {
          roots.push(clone)
        }
        if ((index + 1) % chunkSize === 0) {
          await this.yieldToBrowser()
          if (!isCurrent()) {
            return null
          }
        }
      }
      let cloneIndex = 0
      for (const node of clones.values()) {
        node._isLeaf = node.children.length === 0
        cloneIndex += 1
        if (cloneIndex % chunkSize === 0) {
          await this.yieldToBrowser()
          if (!isCurrent()) {
            return null
          }
        }
      }
      return { count: visibleIndexes.size, roots }
    },
    filterTreeLocally(keyword, isCurrent) {
      const query = keyword.toLocaleLowerCase()
      return this.filterTreeByPredicate(
        (node) => this.getNodeLabel(node).toLocaleLowerCase().includes(query),
        isCurrent
      )
    },
    async showOnlyNodes(nodeIds, options = {}) {
      const includedIds = new Set(
        Array.from(nodeIds || [])
          .filter((id) => id !== undefined && id !== null && id !== '')
          .map(String)
      )
      const query = String(options.keyword ?? this.searchValue)
        .trim()
        .toLocaleLowerCase()
      const requestId = ++this.searchRequestId
      this.debouncedSearch.cancel()
      this.searchAbortController?.abort()
      this.searchAbortController = null
      this.searchLoading = false
      this.cancelAmountLoading()

      const filtered = await this.filterTreeByPredicate(
        (node) => {
          const ids = [this.getNodeAmountResourceId(node), node?.id]
          const selected = ids.some(
            (id) => id !== undefined && id !== null && includedIds.has(String(id))
          )
          return selected && (!query || this.getNodeLabel(node).toLocaleLowerCase().includes(query))
        },
        () => requestId === this.searchRequestId
      )
      if (!filtered || requestId !== this.searchRequestId) {
        return
      }
      this.cancelAmountLoading()
      if (!this.searchMode && !this.normalTreeDeferredBySearch) {
        this.normalNodeAmounts = new Map(this.nodeAmounts)
        this.normalExpandedNodeIds = new Set(this.expandedNodeIds)
      } else if (!this.localFilterMode && this.normalNodeAmounts) {
        this.nodeAmounts.forEach((amount, key) => this.normalNodeAmounts.set(key, amount))
        this.nodeAmounts = new Map(this.normalNodeAmounts)
      }

      this.localFilterMode = true
      this.localFilterNodeIds = includedIds
      this.searchMode = true
      this.treeData = filtered.roots
      this.treeNodeCount = filtered.count
      this.treeKey += 1
      await this.$nextTick()
      await this.expandInitialNodes()
      const currentNode = this.currentNode
        ? this.findTreeNodeIn(this.treeData, this.currentNode.id)
        : null
      this.currentNode = currentNode
      this.$refs.tree?.setCurrentKey(currentNode?.id ?? null)
      this.notifySearchState({
        active: Boolean(query),
        keyword: query,
        resultCount: filtered.count,
        selectedOnly: true,
        ...options.context
      })
      this.startProgressiveAmountLoading()
    },
    restoreAllNodes() {
      this.localFilterMode = false
      this.localFilterNodeIds.clear()
      this.searchValue = ''
      this.searchVisible = false
      this.debouncedSearch.cancel()
      return this.searchTree('')
    },
    notifySearchState(state) {
      this.treeSetting.callback?.onSearchStateChange?.(state)
      this.$emit('search-state-change', state)
    },
    async searchTree(keyword, context = {}) {
      if (this.localFilterMode) {
        return this.showOnlyNodes(this.localFilterNodeIds, { context, keyword })
      }
      const requestId = ++this.searchRequestId
      this.searchAbortController?.abort()
      const controller = new AbortController()
      this.searchAbortController = controller
      this.cancelAmountLoading()
      this.searchLoading = Boolean(keyword)
      if (!keyword) {
        // The aborted request owns an older requestId, so its finally block is
        // intentionally unable to mutate current state. Clear its overlay in
        // the restore branch instead.
        this.searchLoading = false
        const restoredCurrentNode = this.currentNode
          ? this.findTreeNodeIn(this.normalTreeData, this.currentNode.id)
          : null
        const expandedKeys = this.normalExpandedNodeIds ? [...this.normalExpandedNodeIds] : null
        if (this.normalNodeAmounts) {
          this.nodeAmounts = this.normalNodeAmounts
          this.normalNodeAmounts = null
        }
        this.searchMode = false
        this.treeData = this.normalTreeData
        this.treeNodeCount = this.normalTreeNodeCount
        this.treeKey += 1
        await this.$nextTick()
        await this.expandInitialNodes(expandedKeys)
        this.currentNode = restoredCurrentNode
        this.$refs.tree?.setCurrentKey(restoredCurrentNode?.id ?? null)
        this.normalExpandedNodeIds = null
        this.normalTreeDeferredBySearch = false
        this.notifySearchState({ active: false, keyword: '', ...context })
        this.startProgressiveAmountLoading()
        this.searchAbortController = null
        return
      }

      const searchLoader = this.treeSetting.search
      const dataSourceSearch = this.treeSetting.dataSource?.search
      let filtered
      let metadata = {}
      try {
        if (typeof searchLoader === 'function' || typeof dataSourceSearch === 'function') {
          const payload = {
            ...context,
            keyword,
            signal: controller.signal,
            tree: this
          }
          const response =
            typeof searchLoader === 'function'
              ? await searchLoader(payload)
              : await this.loadFromDataSource('search', payload)
          const normalized = await this.normalizeTreeAsync(
            response,
            () => requestId === this.searchRequestId
          )
          if (!normalized) {
            return
          }
          filtered = normalized
          metadata = Array.isArray(response)
            ? {}
            : {
                assetLimit: response?.asset_limit,
                assetTruncated: Boolean(response?.asset_truncated),
                hasMore: Boolean(response?.has_more),
                limit: response?.limit,
                matchedAssetCount: response?.matched_asset_count,
                matchedCount: response?.matched_count,
                matchedNodeCount: response?.matched_node_count,
                nodeLimit: response?.node_limit,
                nodeTruncated: Boolean(response?.node_truncated),
                returnedAssetCount: response?.returned_asset_count,
                returnedCount: response?.returned_count,
                returnedNodeCount: response?.returned_node_count,
                total: response?.total,
                truncated: Boolean(response?.truncated || response?.has_more)
              }
        } else {
          filtered = await this.filterTreeLocally(keyword, () => requestId === this.searchRequestId)
        }
      } catch (error) {
        if (
          requestId !== this.searchRequestId ||
          error?.code === 'ERR_CANCELED' ||
          error?.name === 'AbortError'
        ) {
          return
        }
        this.$log?.warn?.('Search tree failed', error)
        this.notifySearchState({
          active: this.searchMode,
          error,
          keyword,
          ...context
        })
        // Search starts by stopping the existing progressive worker. A real
        // failure keeps the previous tree visible, so resume its unfinished
        // metric batches before returning. Superseded/aborted requests are
        // handled by the newer request and exit above.
        await this.restoreDeferredNormalTree()
        this.startProgressiveAmountLoading()
        return
      } finally {
        if (requestId === this.searchRequestId) {
          this.searchAbortController = null
          this.searchLoading = false
        }
      }
      if (!filtered || requestId !== this.searchRequestId) {
        return
      }
      if (!this.searchMode && !this.normalTreeDeferredBySearch) {
        this.normalNodeAmounts = new Map(this.nodeAmounts)
        this.normalExpandedNodeIds = new Set(this.expandedNodeIds)
      }
      this.searchMode = true
      this.treeData = filtered.roots
      this.treeNodeCount = filtered.count
      this.initializeNodeAmounts(filtered.roots)
      this.treeKey += 1
      await this.$nextTick()
      await this.expandInitialNodes()
      this.notifySearchState({
        active: true,
        keyword,
        resultCount: filtered.count,
        ...context,
        ...metadata
      })
      this.startProgressiveAmountLoading()
    },
    async refresh() {
      this.hideRMenu()
      this.searchValue = ''
      this.searchRequestId += 1
      this.searchAbortController?.abort()
      this.searchAbortController = null
      this.searchLoading = false
      this.searchMode = false
      this.localFilterMode = false
      this.localFilterNodeIds.clear()
      this.normalTreeDeferredBySearch = false
      this.normalNodeAmounts = null
      this.normalExpandedNodeIds = null
      this.treeSetting.callback?.beforeRefresh?.()
      await this.treeSetting.callback?.refresh?.()
      await this.loadRoot(true)
    },
    handleAssetScopeChange(value) {
      const nextValue = String(value)
      this.closeToolsDropdown()
      if (nextValue === this.assetScope) {
        return
      }
      this.assetScope = nextValue
      setAssetScopeValue(this.$cookie, this.treeSetting, this.assetScope)
      this.reloadVisibleNodeAmounts({ resetNormal: true })
      this.treeSetting.callback?.onAssetScopeChange?.(this.assetScope, this.currentNode)
      if (this.currentNode) {
        this.handleNodeLabelClick(null, this.currentNode)
      }
    },
    handleNodeRowClick(data, node, ...args) {
      if (this.isLeafNode(data)) {
        // Both tree components pass the mouse event last, after different node arguments.
        this.handleNodeLabelClick(args.at(-1), data)
      } else if (this.useVirtualTree) {
        // TreeV2's automatic row expansion also toggles leaves, so only toggle branches here.
        const tree = this.$refs.tree
        if (node.expanded) {
          tree?.collapseNode(node)
        } else {
          tree?.expandNode(node)
        }
      }
    },
    handleNodeLabelClick(event, data) {
      if (
        typeof this.treeSetting.beforeNodeSelect === 'function' &&
        this.treeSetting.beforeNodeSelect(event, data, { tree: this }) === false
      ) {
        return
      }
      if (!this.isNodeSelectable(data)) {
        this.toggleNodeExpansion(data)
        return
      }
      this.currentNode = data
      this.$refs.tree?.setCurrentKey(data.id)
      this.$emit('selected', data, {
        assetScope: this.assetScope
      })
      const onSelected = this.treeSetting.callback?.onSelected
      if (onSelected) {
        onSelected(event, data, { assetScope: this.assetScope })
      } else {
        this.emitSelectedUrl(data)
      }
    },
    toggleNodeExpansion(data) {
      if (!data || this.isLeafNode(data)) {
        return
      }
      const tree = this.$refs.tree
      const node = tree?.getNode?.(data.id)
      if (!node) {
        return
      }
      if (this.useVirtualTree) {
        if (node.expanded) {
          tree.collapseNode?.(node)
        } else {
          tree.expandNode?.(node)
        }
      } else if (node.expanded) {
        node.collapse?.()
      } else {
        node.expand?.()
      }
    },
    emitSelectedUrl(treeNode) {
      if (!this.treeSetting.url) {
        return
      }
      const separator = this.treeSetting.url.includes('?') ? '&' : '?'
      const showCurrentAsset = getAssetScopeValue(this.$cookie, this.treeSetting)
      let url = ''
      if (treeNode.meta?.type === 'node') {
        url = `${this.treeSetting.url}${separator}node_id=${treeNode.meta.data.id}&show_current_asset=${showCurrentAsset}`
      } else if (treeNode.meta?.type === 'asset') {
        url = `${this.treeSetting.url}${separator}asset_id=${treeNode.meta.data?.id || treeNode.id}&show_current_asset=${showCurrentAsset}`
      }
      if (url) {
        this.$emit('url-change', url)
      }
    },
    shouldShowMenu(data) {
      if (this.treeSetting.readOnly) {
        return false
      }
      let showMenu = this.treeSetting.showMenu
      if (typeof showMenu === 'function') {
        showMenu = showMenu(data)
      }
      return Boolean(showMenu && this.treeSetting.hasRightMenu && data.id !== '-12')
    },
    handleNodeContextMenu(event, data) {
      event.preventDefault()
      if (!this.shouldShowMenu(data)) {
        this.hideRMenu()
        return
      }
      this.currentNode = data
      this.$refs.tree?.setCurrentKey(data.id)
      this.menuVisible = true
      this.menuPosition = { x: event.clientX, y: event.clientY }
      this.$nextTick(() => {
        const menu = this.$refs.contextMenu
        if (!menu) {
          return
        }
        const padding = 8
        this.menuPosition = {
          x: Math.min(event.clientX, window.innerWidth - menu.offsetWidth - padding),
          y: Math.min(event.clientY, window.innerHeight - menu.offsetHeight - padding)
        }
      })
    },
    hideRMenu() {
      this.menuVisible = false
    },
    handleContextMenuKeydown(event) {
      if (!this.menuVisible || event.key !== 'Escape') {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      this.hideRMenu()
    },
    handleContextMenuClick(event) {
      const menuItem = event.target?.closest?.('.rmenu')
      if (!menuItem || menuItem.classList.contains('disabled')) {
        return
      }
      this.hideRMenu()
    },
    hasMenuItem(item) {
      return typeof item.has === 'function' ? item.has(this.currentNode) : item.has !== false
    },
    checkDisabled(item) {
      return typeof item.disabled === 'function'
        ? item.disabled(this.currentNode)
        : Boolean(item.disabled)
    },
    handleMenuItemClick(item) {
      if (this.checkDisabled(item)) {
        return
      }
      item.callback?.(this.currentNode)
      this.hideRMenu()
    },
    async ensureExpanded(data) {
      const node = this.$refs.tree?.getNode(data.id)
      if (!node || node.expanded) {
        return
      }
      if (this.useVirtualTree) {
        this.$refs.tree?.expandNode(node)
        return
      }
      await new Promise((resolve) => {
        const timer = window.setTimeout(resolve, 1200)
        node.expand(() => {
          window.clearTimeout(timer)
          resolve()
        })
      })
    },
    async createTreeNode() {
      const parent = this.currentNode
      if (!parent) {
        return
      }
      await this.ensureExpanded(parent)
      const url = `${this.treeSetting.nodeUrl}${parent.meta.data.id}/children/`
      try {
        const response =
          typeof this.treeSetting.dataSource?.create === 'function'
            ? await this.loadFromDataSource('create', { parent })
            : await this.$axios.post(url, {})
        const node = this.normalizeNode({
          id: response.key,
          name: response.value,
          pId: parent.id,
          hasChildren: false,
          isParent: false,
          assets_amount: 0,
          meta: { data: { ...response, has_children: false }, type: 'node' }
        })
        delete node.assets_amount
        this.setNodeAmount(node, 0)
        if (this.useVirtualTree) {
          this.prependRawTreeNode(parent, node)
          this.prependNodeToNormalTreeWhenSearching(parent, node)
          this.treeNodeCount += 1
          this.normalTreeNodeCount += 1
          // Rebuild only el-tree-v2's local flattened index. Calling loadRoot
          // here caused an unnecessary API request and reset the whole tree.
          this.$refs.tree?.setData(this.treeData)
          await this.activateCreatedNode(parent, node)
          return
        }
        const firstChild = parent.children?.[0]
        if (firstChild) {
          this.$refs.tree?.insertBefore(node, firstChild)
        } else {
          this.$refs.tree?.append(node, parent)
        }
        this.setTreeNodeLeafState(node, true)
        this.setTreeNodeLeafState(this.$refs.tree?.getNode(parent.id) || parent, false)
        this.prependNodeToNormalTreeWhenSearching(parent, node)
        this.treeNodeCount += 1
        this.normalTreeNodeCount += 1
        await this.activateCreatedNode(parent, node)
      } catch (error) {
        this.$message.error(`${this.$tc('CreateErrorMsg')} ${error}`)
      }
    },
    async activateCreatedNode(parent, node) {
      await this.$nextTick()
      if (this.useVirtualTree) {
        this.$refs.tree?.setExpandedKeys([...this.expandedNodeIds])
      }
      await this.ensureExpanded(parent)
      this.currentNode = node
      this.$refs.tree?.setCurrentKey(node.id)
      this.$message.success(this.$tc('CreateSuccessMsg'))
      this.startRename(node)
    },
    startRename(node = this.currentNode) {
      if (!node) {
        return
      }
      const match = this.getNodeLabel(node).match(/^(.+?)\s*\((\d+)\)$/)
      this.currentNode = node
      this.editingKey = String(node.id)
      this.renameSource = node.meta?.data?.value || match?.[1] || this.getNodeLabel(node)
      const amount = this.getNodeAmount(node)
      this.renameAssetsAmount = Number.isFinite(amount) ? amount : match ? Number(match[2]) : null
      if (!Number.isFinite(amount) && this.renameAssetsAmount !== null) {
        this.setNodeAmount(node, this.renameAssetsAmount)
      }
      this.editValue = this.renameSource
      this.hideRMenu()
      this.$nextTick(() => {
        const input = Array.isArray(this.$refs.renameInput)
          ? this.$refs.renameInput[0]
          : this.$refs.renameInput
        input?.focus?.()
        input?.select?.()
      })
    },
    cancelRename() {
      this.editingKey = ''
      this.editValue = ''
    },
    async finishRename(node) {
      if (this.editingKey !== String(node.id)) {
        return
      }
      const value = this.editValue.trim()
      this.editingKey = ''
      if (!value || value === this.renameSource) {
        return
      }
      try {
        const response =
          typeof this.treeSetting.dataSource?.update === 'function'
            ? await this.loadFromDataSource('update', { node, value })
            : await this.$axios.patch(`${this.treeSetting.nodeUrl}${node.meta.data.id}/`, { value })
        node.meta.data = { ...node.meta.data, ...response }
        node.name = value
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      } finally {
        this.renameSource = ''
        this.renameAssetsAmount = null
      }
    },
    async removeTreeNode() {
      const node = this.currentNode
      if (!node) {
        return
      }
      const normalNode = this.searchMode
        ? this.findTreeNodeIn(this.normalTreeData, node.id) || node
        : node
      const visibleRemovedCount = this.countTreeNodes(node)
      const normalRemovedCount = this.countTreeNodes(normalNode)
      const wasVirtualTree = this.useVirtualTree
      if (typeof this.treeSetting.dataSource?.remove === 'function') {
        await this.loadFromDataSource('remove', { node })
      } else {
        await this.$axios.delete(`${this.treeSetting.nodeUrl}${node.meta.data.id}/`)
      }

      if (wasVirtualTree) {
        this.removeRawTreeNode(this.treeData, node.id)
      } else {
        const treeNode = this.$refs.tree?.getNode(node.id)
        const parentNode = treeNode?.parent
        this.$refs.tree?.remove(node)
        if (parentNode?.level > 0 && parentNode.childNodes.length === 0) {
          this.setTreeNodeLeafState(parentNode, true)
        }
      }

      if (this.searchMode && normalNode !== node) {
        this.removeRawTreeNode(this.normalTreeData, normalNode.id)
      }
      this.removeNodeState(normalNode)
      this.treeNodeCount = Math.max(0, this.treeNodeCount - visibleRemovedCount)
      this.normalTreeNodeCount = Math.max(0, this.normalTreeNodeCount - normalRemovedCount)
      this.currentNode = null
      if (wasVirtualTree) {
        // Update only the virtual tree's local flattened index. Do not request
        // the complete node structure again after a successful deletion.
        this.$refs.tree?.setData(this.treeData)
      }
      this.$message.success(this.$tc('DeleteSuccessMsg'))
    },
    allowDrag(node) {
      return this.canMove && node.data?.meta?.type === 'node' && node.data.id !== '-12'
    },
    canDragData(data) {
      return this.canMove && data?.meta?.type === 'node' && data.id !== '-12'
    },
    handleVirtualDragStart(event, data, node) {
      if (!this.canDragData(data)) {
        event.preventDefault()
        return
      }
      this.virtualDraggingNode = data
      this.virtualDropTargetId = ''
      this.dragSourceAncestorNodes = this.collectAncestorNodeData(node)
      this.dragSourcePlacement = null
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(data.id))
      this.setDragPreview(event, data)
    },
    handleVirtualDragEnd() {
      this.virtualDraggingNode = null
      this.virtualDropTargetId = ''
      this.dragSourceAncestorNodes = []
      this.dragSourcePlacement = null
      this.removeDragPreview()
    },
    canUseVirtualDropTarget(data) {
      return Boolean(
        this.virtualDraggingNode &&
        this.canDragData(data) &&
        String(this.virtualDraggingNode.id) !== String(data.id) &&
        !this.isTreeNodeDescendant(this.virtualDraggingNode, data)
      )
    },
    isVirtualDropTarget(data) {
      return Boolean(
        this.virtualDropTargetId && String(this.virtualDropTargetId) === String(data.id)
      )
    },
    isOperationTarget(data) {
      const operationNodeId = this.treeSetting.operationNodeId
      if (
        operationNodeId === undefined ||
        operationNodeId === null ||
        operationNodeId === '' ||
        data?.meta?.type !== 'node'
      ) {
        return false
      }
      return this.getNodeAmountKey(data) === String(operationNodeId)
    },
    handleVirtualDragOver(event, data) {
      if (!this.canUseVirtualDropTarget(data)) {
        return
      }
      event.preventDefault()
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move'
      }
      if (String(this.virtualDropTargetId) !== String(data.id)) {
        this.virtualDropTargetId = data.id
      }
    },
    handleVirtualDragLeave(event, data) {
      if (this.isVirtualDropTarget(data) && !event.currentTarget.contains(event.relatedTarget)) {
        this.virtualDropTargetId = ''
      }
    },
    handleNodeDragStart(node, event) {
      this.dragSourceAncestorNodes = this.collectAncestorNodeData(node)
      const siblings = node.parent?.childNodes || []
      const sourceIndex = siblings.indexOf(node)
      this.dragSourcePlacement = {
        parentNode: node.parent?.level > 0 ? node.parent : null,
        parentData: node.parent?.level > 0 ? node.parent.data : null,
        previousSiblingData: siblings[sourceIndex - 1]?.data || null,
        nextSiblingData: siblings[sourceIndex + 1]?.data || null
      }
      this.setDragPreview(event, node.data)
    },
    handleNodeDragEnd(draggingNode, dropNode, type) {
      this.removeDragPreview()
      if (!dropNode || type === 'none') {
        this.dragSourceAncestorNodes = []
        this.dragSourcePlacement = null
      }
    },
    collectAncestorNodeData(node, includeSelf = false) {
      const ancestors = []
      let current = includeSelf ? node : node?.parent
      while (current) {
        if (current.data?.meta?.type === 'node') {
          ancestors.push(current.data)
        }
        current = current.parent
      }
      return ancestors
    },
    setDragPreview(event, data) {
      if (!event.dataTransfer) {
        return
      }
      this.removeDragPreview()
      const preview = document.createElement('div')
      preview.className = 'x-tree-drag-preview'
      const icon = event.currentTarget?.querySelector('.x-tree__node-icon svg')?.cloneNode(true)
      if (icon) {
        icon.classList.add('x-tree-drag-preview__icon')
        preview.appendChild(icon)
      }
      const label = document.createElement('span')
      label.className = 'x-tree-drag-preview__label'
      label.textContent = this.getNodeLabel(data)
      preview.appendChild(label)
      document.body.appendChild(preview)
      event.dataTransfer.setDragImage(preview, 12, preview.offsetHeight + 8)
      this.dragPreviewElement = preview
    },
    removeDragPreview() {
      this.dragPreviewElement?.remove()
      this.dragPreviewElement = null
    },
    restoreDraggedNode(data) {
      if (this.useVirtualTree || !this.dragSourcePlacement) {
        return
      }
      const tree = this.$refs.tree
      const { parentData, previousSiblingData, nextSiblingData } = this.dragSourcePlacement
      tree?.remove(data)
      if (nextSiblingData && tree?.getNode(nextSiblingData)) {
        tree.insertBefore(data, nextSiblingData)
      } else if (previousSiblingData && tree?.getNode(previousSiblingData)) {
        tree.insertAfter(data, previousSiblingData)
      } else {
        tree?.append(data, parentData)
      }
      this.$nextTick(() => {
        if (String(this.currentNode?.id) === String(data.id)) {
          tree?.setCurrentKey(data.id)
        }
        const stack = [data]
        while (stack.length) {
          const node = stack.pop()
          if (this.expandedNodeIds.has(String(node.id))) {
            tree?.getNode(node.id)?.expand()
          }
          if (node.children?.length) {
            stack.push(...node.children)
          }
        }
      })
    },
    async requestDropConfirmation(draggingNode, dropNode) {
      const message = this.$t('NodeMoveConfirmMessage', {
        src: this.getNodeLabel(draggingNode.data),
        dst: this.getNodeLabel(dropNode.data)
      })
      try {
        await this.$alert(message, this.$t('NodeMoveConfirmTitle'), {
          type: 'info',
          showCancelButton: true,
          confirmButtonText: this.$t('Confirm'),
          cancelButtonText: this.$t('Cancel')
        })
        return true
      } catch {
        return false
      }
    },
    handleVirtualNodeDrop(data, node) {
      this.virtualDropTargetId = ''
      if (
        !this.virtualDraggingNode ||
        !this.canDragData(data) ||
        this.virtualDraggingNode.id === data.id ||
        this.isTreeNodeDescendant(this.virtualDraggingNode, data)
      ) {
        return
      }
      const draggingNode = { data: this.virtualDraggingNode }
      this.virtualDraggingNode = null
      this.handleNodeDrop(draggingNode, node, 'inner')
    },
    isTreeNodeDescendant(parent, target) {
      const targetId = String(target.id)
      const stack = [...(parent.children || [])]
      while (stack.length) {
        const node = stack.pop()
        if (String(node.id) === targetId) {
          return true
        }
        if (node.children?.length) {
          stack.push(...node.children)
        }
      }
      return false
    },
    moveVirtualTreeNode(node, target, sourceAncestors) {
      const sourceParent = sourceAncestors[0]
      const sourceChildren = sourceParent?.children || this.treeData
      const sourceIndex = sourceChildren.findIndex((item) => String(item.id) === String(node.id))
      if (sourceIndex === -1) {
        return
      }
      sourceChildren.splice(sourceIndex, 1)
      if (sourceParent && sourceParent.children.length === 0) {
        this.setTreeNodeLeafState(sourceParent, true)
      }
      target.children ||= []
      target.children.push(node)
      this.setTreeNodeLeafState(target, false)
      node.pId = target.id
      node.parent_key = target.id
      if (node.meta?.data) {
        node.meta.data.parent_key = target.id
      }
      // Rebuild only el-tree-v2's flattened index. Replacing treeData would
      // trigger its data watcher and reset the current expansion state.
      this.$refs.tree?.setData(this.treeData)
      if (this.currentNode) {
        this.$refs.tree?.setCurrentKey(this.currentNode.id)
      }
    },
    setTreeNodeLeafState(node, isLeaf) {
      const data = node?.data || node
      if (!data) {
        return
      }
      data._isLeaf = isLeaf
      data.hasChildren = !isLeaf
      data.isParent = !isLeaf
      if (data.meta?.data) {
        data.meta.data.has_children = !isLeaf
      }
      if (node?.data) {
        node.isLeafByUser = isLeaf
        node.isLeaf = isLeaf
        node.updateLeafState?.()
      }
    },
    syncMovedNodeLeafStates(dropNode, sourcePlacement) {
      this.setTreeNodeLeafState(dropNode, false)
      const sourceParentNode = sourcePlacement?.parentNode
      if (sourceParentNode && sourceParentNode.childNodes.length === 0) {
        this.setTreeNodeLeafState(sourceParentNode, true)
      }
    },
    allowDrop(draggingNode, dropNode, type) {
      return (
        this.canMove &&
        type === 'inner' &&
        dropNode.data?.meta?.type === 'node' &&
        draggingNode.data.id !== dropNode.data.id
      )
    },
    async handleNodeDrop(draggingNode, dropNode, type) {
      const sourceAncestors = [...this.dragSourceAncestorNodes]
      const sourcePlacement = this.dragSourcePlacement
      if (type !== 'inner') {
        this.dragSourceAncestorNodes = []
        this.restoreDraggedNode(draggingNode.data)
        this.dragSourcePlacement = null
        return
      }
      const confirmed = await this.requestDropConfirmation(draggingNode, dropNode)
      if (!confirmed) {
        this.restoreDraggedNode(draggingNode.data)
        this.dragSourceAncestorNodes = []
        this.dragSourcePlacement = null
        return
      }
      try {
        if (typeof this.treeSetting.dataSource?.move === 'function') {
          await this.loadFromDataSource('move', {
            node: draggingNode.data,
            sourceAncestors,
            target: dropNode.data
          })
        } else {
          await this.$axios.put(
            `${this.treeSetting.nodeUrl}${dropNode.data.meta.data.id}/children/add/`,
            { nodes: [draggingNode.data.meta.data.id] }
          )
        }
        const targetAncestors = this.collectAncestorNodeData(dropNode, true)
        if (this.useVirtualTree) {
          this.moveVirtualTreeNode(draggingNode.data, dropNode.data, sourceAncestors)
        } else {
          this.syncMovedNodeLeafStates(dropNode, sourcePlacement)
        }
        this.refreshNodeAmounts([...sourceAncestors, ...targetAncestors])
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      } catch (error) {
        if (!this.useVirtualTree) {
          this.restoreDraggedNode(draggingNode.data)
        }
        this.$message.error(`${this.$tc('UpdateErrorMsg')} ${error}`)
      } finally {
        this.dragSourceAncestorNodes = []
        this.dragSourcePlacement = null
      }
    },
    getSelectedNodes() {
      return this.currentNode ? [this.currentNode] : []
    },
    clearSelection() {
      const previous = this.currentNode
      this.currentNode = null
      this.$refs.tree?.setCurrentKey(null)
      return previous
    },
    getNodes() {
      return this.treeData
    },
    getAllNodes() {
      return this.normalTreeData
    },
    rememberNodeChildrenViewSource(parent, children, options = {}) {
      const key = String(parent?.id ?? '')
      if (!key) {
        return
      }
      const existing = this.nodeChildrenViewSources.get(key)
      if (existing && !options.replace) {
        existing.parent = parent
        return
      }
      this.nodeChildrenViewSources.set(key, {
        children: [...(children || [])],
        parent
      })
    },
    getNodeChildrenViewParents() {
      return [...this.nodeChildrenViewSources.values()].map((item) => item.parent)
    },
    async setNodeChildrenView(parent, options = {}) {
      const key = String(parent?.id ?? '')
      if (!key) {
        return []
      }
      if (!this.nodeChildrenViewSources.has(key)) {
        this.rememberNodeChildrenViewSource(parent, parent.children || [])
      }
      const source = this.nodeChildrenViewSources.get(key)?.children || []
      const ordered = typeof options.sort === 'function' ? options.sort([...source]) : [...source]
      const visible =
        typeof options.filter === 'function' ? ordered.filter(options.filter) : ordered
      parent._isLeaf = visible.length === 0 && source.length === 0

      if (this.useVirtualTree) {
        parent.children = visible
        this.$refs.tree?.setData(this.treeData)
      } else if (this.$refs.tree?.getNode?.(parent.id) && this.$refs.tree?.updateKeyChildren) {
        // Element Plus removes the current child nodes before appending the
        // replacement list. That removal mutates parent.children in place, so
        // assigning `visible` to parent.children before this call would also
        // empty the replacement array and render an incomplete/blank view.
        this.$refs.tree.updateKeyChildren(parent.id, visible)
      } else {
        // The parent may be temporarily hidden by an ancestor's local view.
        // Keep its data object current so the right view is restored when that
        // ancestor becomes visible again.
        parent.children = visible
      }
      if (!options.defer) {
        await this.finalizeNodeChildrenViews()
      }
      return visible
    },
    async finalizeNodeChildrenViews() {
      this.treeNodeCount = this.countTreeNodes({ children: this.treeData }) - 1
      if (!this.searchMode) {
        this.normalTreeNodeCount = this.treeNodeCount
      }
      await this.$nextTick()
      if (!this.useVirtualTree) {
        const stack = [...this.treeData]
        while (stack.length) {
          const node = stack.pop()
          if (this.expandedNodeIds.has(String(node.id))) {
            this.$refs.tree?.getNode(node.id)?.expand()
          }
          if (node.children?.length) {
            stack.push(...node.children)
          }
        }
      }
      this.rebuildProgressiveAmountWindow()
    },
    getTreeSnapshot() {
      return {
        nodes: this.normalTreeData,
        amounts: Object.fromEntries(this.nodeAmounts),
        assetScope: this.assetScope
      }
    },
    prependRawTreeNode(parent, node) {
      parent.children ||= []
      if (!parent.children.some((item) => String(item.id) === String(node.id))) {
        parent.children.unshift(node)
      }
      this.setTreeNodeLeafState(node, true)
      this.setTreeNodeLeafState(parent, false)
    },
    countTreeNodes(root) {
      let count = 0
      const stack = root ? [root] : []
      while (stack.length) {
        const node = stack.pop()
        count += 1
        if (node.children?.length) {
          stack.push(...node.children)
        }
      }
      return count
    },
    removeNodeState(root) {
      const stack = root ? [root] : []
      while (stack.length) {
        const node = stack.pop()
        this.setNodeAmount(node, null)
        this.expandedNodeIds.delete(String(node.id))
        if (node.children?.length) {
          stack.push(...node.children)
        }
      }
    },
    removeRawTreeNode(roots, id) {
      const target = String(id)
      const stack = [{ parent: null, siblings: roots }]
      while (stack.length) {
        const { parent, siblings } = stack.pop()
        const index = siblings.findIndex((item) => String(item.id) === target)
        if (index !== -1) {
          const [removed] = siblings.splice(index, 1)
          if (parent && siblings.length === 0) {
            this.setTreeNodeLeafState(parent, true)
          }
          return removed
        }
        for (const node of siblings) {
          if (node.children?.length) {
            stack.push({ parent: node, siblings: node.children })
          }
        }
      }
      return null
    },
    prependNodeToNormalTreeWhenSearching(parent, node) {
      if (!this.searchMode) {
        return
      }
      const normalParent = this.findTreeNodeIn(this.normalTreeData, parent.id)
      if (normalParent && normalParent !== parent) {
        this.prependRawTreeNode(normalParent, node)
      }
    },
    findTreeNodeIn(roots, id) {
      const target = String(id)
      const stack = [...roots]
      while (stack.length) {
        const node = stack.pop()
        if (String(node.id) === target) {
          return node
        }
        if (node.children?.length) {
          stack.push(...node.children)
        }
      }
      return null
    },
    findTreeNode(id) {
      return this.findTreeNodeIn(this.treeData, id)
    },
    getExpandedKeys() {
      return [...this.expandedNodeIds]
    },
    getNodePath(id) {
      const target = String(id)
      const stack = this.treeData.map((node) => ({ node, path: [node] }))
      while (stack.length) {
        const { node, path } = stack.pop()
        if (String(node.id) === target) {
          return path
        }
        for (const child of node.children || []) {
          stack.push({ node: child, path: [...path, child] })
        }
      }
      return []
    },
    async setExpandedKeys(keys = []) {
      const tree = this.$refs.tree
      if (!tree) {
        return
      }
      const normalizedKeys = [...new Set(keys.map((key) => String(key)))]
      this.suppressExpandAmountLoading = true
      try {
        if (this.useVirtualTree) {
          tree.setExpandedKeys(normalizedKeys)
        } else {
          const renderedNodes = []
          const stack = [...(tree.store?.root?.childNodes || [])]
          while (stack.length) {
            const node = stack.pop()
            renderedNodes.push(node)
            if (node.childNodes?.length) {
              stack.push(...node.childNodes)
            }
          }
          renderedNodes.reverse().forEach((node) => node.collapse())
          normalizedKeys.forEach((key) => tree.getNode(key)?.expand())
        }
        await this.$nextTick()
        this.expandedNodeIds = new Set(normalizedKeys)
      } finally {
        this.suppressExpandAmountLoading = false
      }
      this.rebuildProgressiveAmountWindow()
    },
    expandAll() {
      const keys = []
      const stack = [...this.treeData]
      while (stack.length) {
        const node = stack.pop()
        if (!this.isLeafNode(node)) {
          keys.push(node.id)
        }
        if (node.children?.length) {
          stack.push(...node.children)
        }
      }
      return this.setExpandedKeys(keys)
    },
    collapseAll() {
      return this.setExpandedKeys([])
    },
    collapseStepwise() {
      return this.collapseTreeStepwise()
    },
    expandToNode(id) {
      const path = this.getNodePath(id)
      return this.setExpandedKeys(path.slice(0, -1).map((node) => node.id))
    },
    selectNode(node) {
      if (!node) {
        return
      }
      this.currentNode = node
      this.$refs.tree?.setCurrentKey(node.id)
      return node
    }
  }
}
</script>

<style lang="scss" scoped>
@use './toolbar' as treeToolbar;

.x-tree {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 204px);
  min-height: 360px;
  background: var(--el-bg-color, #fff);
}

.x-tree__header-actions {
  @include treeToolbar.header-actions;

  &.has-header-search {
    position: static;
    z-index: auto;
    box-sizing: border-box;
    width: 100%;
    height: var(--x-tree-toolbar-height, 40px);
    min-width: 0;
    padding: var(--x-tree-toolbar-padding-block, 5px) var(--x-tree-toolbar-padding-inline, 8px);
  }
}

.x-tree__toolbar-prepend {
  display: contents;

  :deep(.x-tree__tool-button) {
    @include treeToolbar.tool-button;

    margin: 0;
  }

  :deep(.x-tree__tool-icon) {
    @include treeToolbar.tool-icon;
  }
}

.x-tree__search-row {
  @include treeToolbar.search-row;
}

@include treeToolbar.search-transition('x-tree-search');

.x-tree__search {
  @include treeToolbar.search-control;

  flex: 1;

  :deep(.el-input__wrapper),
  :deep(.el-input__wrapper:hover),
  :deep(.el-input__wrapper.is-focus) {
    width: 100%;
    height: 28px;
    border: 0 !important;
    outline: none !important;
    background-color: transparent;
    box-shadow: none !important;
  }

  :deep(.el-input__inner) {
    height: 28px;
    font-size: 13px;
  }
}

.x-tree__header-search {
  min-width: 80px;
  margin-right: 7px;
}

.x-tree__tool-button {
  @include treeToolbar.tool-button;
}

.x-tree__tool-icon {
  @include treeToolbar.tool-icon;
}

.x-tree__body {
  --tree-scrollbar-size: 6px;

  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  margin-top: var(--x-tree-body-separator-space-before, 5px);
  padding-top: var(--x-tree-body-separator-space-after, 5px);
  padding-right: var(--x-tree-body-inline-padding, 0);
  padding-left: var(--x-tree-body-inline-padding, 0);
  border-top: var(
    --x-tree-body-border-top,
    1px solid var(--panel-border-color, var(--el-border-color))
  );
}

.x-tree__viewport {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;

  &::-webkit-scrollbar {
    -webkit-appearance: none;
    width: var(--tree-scrollbar-size);
    height: var(--tree-scrollbar-size);
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  &::-webkit-scrollbar-track,
  &::-webkit-scrollbar-track-piece,
  &::-webkit-scrollbar-corner {
    -webkit-appearance: none;
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  &::-webkit-scrollbar-thumb {
    border: 0;
    border-radius: 999px;
    background-color: transparent;
    box-shadow: none;
  }

  &:hover {
    scrollbar-color: color-mix(in srgb, var(--el-text-color-secondary) 45%, transparent) transparent;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: color-mix(in srgb, var(--el-text-color-secondary) 45%, transparent);
  }
}

.x-tree.is-search-visible .x-tree__body {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}

.x-tree__body.is-virtual .x-tree__viewport {
  overflow: hidden;
}

.x-tree__body.is-virtual :deep(.el-tree-virtual-list) {
  min-width: 100%;
  overflow: auto !important;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.x-tree__body.is-virtual :deep(.el-tree-virtual-list)::-webkit-scrollbar {
  -webkit-appearance: none;
  display: block;
  width: var(--tree-scrollbar-size);
  height: var(--tree-scrollbar-size);
  border: 0;
  background: transparent;
  box-shadow: none;
}

.x-tree__body.is-virtual :deep(.el-tree-virtual-list)::-webkit-scrollbar-track,
.x-tree__body.is-virtual :deep(.el-tree-virtual-list)::-webkit-scrollbar-track-piece,
.x-tree__body.is-virtual :deep(.el-tree-virtual-list)::-webkit-scrollbar-corner {
  -webkit-appearance: none;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.x-tree__body.is-virtual :deep(.el-tree-virtual-list)::-webkit-scrollbar-thumb {
  border: 0;
  border-radius: 999px;
  background-color: transparent;
  box-shadow: none;
}

.x-tree__body.is-virtual :deep(.el-tree-virtual-list:hover) {
  scrollbar-color: color-mix(in srgb, var(--el-text-color-secondary) 45%, transparent) transparent;
}

.x-tree__body.is-virtual :deep(.el-tree-virtual-list:hover)::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--el-text-color-secondary) 45%, transparent);
}

.x-tree__body.is-virtual :deep(.el-virtual-scrollbar) {
  display: none !important;
}

.x-tree__body :deep(.el-tree) {
  min-width: max-content;
  background: transparent;
  color: var(--el-text-color-regular);
}

.x-tree__body :deep(.el-tree-node__content) {
  height: var(--x-tree-row-height);
  border-radius: 4px;
  padding-right: 8px;
  user-select: none;
}

.x-tree__body :deep(.el-tree-node__content:hover) {
  background: var(--el-fill-color-light);
}

.x-tree__body :deep(.el-tree-node.is-current > .el-tree-node__content) {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.x-tree__body
  :deep(.el-tree-node__content:has(.x-tree__node.is-operation-target))
  .x-tree__node-label,
.x-tree__body
  :deep(.el-tree-node__content:has(.x-tree__node.is-operation-target))
  .x-tree__node-amount {
  color: var(--el-color-warning-dark-2);
}

.x-tree__body :deep(.el-tree-node.is-drop-inner > .el-tree-node__content) {
  position: relative;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  box-shadow: inset 0 0 0 1px var(--el-color-primary);
}

.x-tree__body.is-virtual :deep(.el-tree-node__content:has(.x-tree__node.is-virtual-drop-target)) {
  position: relative;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  box-shadow: inset 0 0 0 1px var(--el-color-primary-light-5);
}

.x-tree__body :deep(.el-tree-node.is-drop-inner > .el-tree-node__content) .x-tree__node-icon,
.x-tree__body :deep(.el-tree-node.is-drop-inner > .el-tree-node__content) .x-tree__node-label,
.x-tree__body.is-virtual
  :deep(.el-tree-node__content:has(.x-tree__node.is-virtual-drop-target))
  .x-tree__node-icon,
.x-tree__body.is-virtual
  :deep(.el-tree-node__content:has(.x-tree__node.is-virtual-drop-target))
  .x-tree__node-label {
  color: var(--el-color-primary);
}

.x-tree__body :deep(.el-tree-node__expand-icon) {
  color: var(--el-text-color-secondary);
  font-size: 11px;
  transition: transform 0.12s ease-out;
}

.x-tree__body :deep(.el-collapse-transition-enter-active),
.x-tree__body :deep(.el-collapse-transition-leave-active) {
  transition: none !important;
}

.x-tree__node {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  height: 100%;
}

.x-tree__node.is-disabled {
  opacity: 0.45;
}

.x-tree__node-toggle {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
}

.x-tree__node-icon {
  flex: none;
}

.x-tree__node-select {
  display: flex;
  flex: 1;
  align-items: center;
  align-self: stretch;
  min-width: 0;
  padding-left: 2px;
  cursor: pointer;
}

.x-tree__node-label {
  flex: none;
  overflow: visible;
  color: var(--el-text-color-primary);
  text-overflow: clip;
  white-space: nowrap;
}

.x-tree__body :deep(.el-tree-node.is-current > .el-tree-node__content) .x-tree__node-label {
  color: var(--el-color-primary);
}

.x-tree__node-amount {
  flex: none;
  margin-left: 4px;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}

.x-tree__rename {
  width: 180px;
  user-select: text;
}

.x-tree__rename :deep(.el-input__inner) {
  user-select: text;
}

.x-tree__body :deep(.el-empty) {
  padding-top: 80px;
}

.x-tree__body.is-empty :deep(.el-tree__empty-block) {
  display: none;
}
</style>

<style lang="scss">
.x-tree-drag-preview {
  position: fixed;
  top: -1000px;
  left: -1000px;
  z-index: 4000;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 200px;
  box-sizing: border-box;
  padding: 5px 10px;
  border: 1px solid var(--el-color-primary-light-5);
  border-radius: 5px;
  color: var(--el-color-primary);
  background: var(--el-bg-color-overlay, #fff);
  box-shadow: var(--el-box-shadow-light);
  font-size: 12px;
  line-height: 18px;
  pointer-events: none;
  white-space: nowrap;
}

.x-tree-drag-preview__icon {
  flex: none;
  width: 14px;
  height: 14px;
  color: var(--el-color-primary);
  fill: currentColor;
}

.x-tree-drag-preview__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.x-tree-tools-popper {
  width: max-content;
  min-width: 200px;
  box-sizing: border-box;
  padding: 6px !important;
  border: 1px solid var(--el-border-color-lighter) !important;
  border-radius: 8px !important;
  background: var(--el-bg-color-overlay, #fff) !important;
  box-shadow: var(--el-box-shadow-light) !important;
}

// Dropdown items reclaim focus while the hover popper is leaving. Closing the
// tools menu immediately keeps focus on controls opened by a menu command.
.x-tree-tools-popper.el-zoom-in-top-leave-active {
  transition-duration: 0s !important;
}

.x-tree-tools-popper .x-tree-tools__menu {
  position: relative;
  padding: 0;
}

.node-asset-tree-tools-popper .el-scrollbar,
.node-asset-tree-tools-popper .el-scrollbar__wrap {
  overflow: visible !important;
}

.x-tree-tools-popper .el-dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  height: 32px;
  margin: 0;
  padding: 0 10px;
  border-radius: 5px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  font-weight: 400;
  line-height: 32px;
}

.x-tree-tools-popper .el-dropdown-menu__item:not(.is-disabled):hover,
.x-tree-tools-popper .el-dropdown-menu__item:not(.is-disabled):focus,
.x-tree-tools-popper .el-dropdown-menu__item.is-active {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.x-tree-tools-popper .el-dropdown-menu__item.is-disabled {
  color: var(--el-text-color-disabled);
  background: transparent;
}

.x-tree-tools__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.x-tree-tools__icon > .el-icon,
.x-tree-tools__icon > .svg-icon {
  width: 13px;
  height: 13px;
  margin: 0;
  color: inherit;
}

.x-tree-tools-popper .el-dropdown-menu__item:not(.is-disabled):hover .x-tree-tools__icon,
.x-tree-tools-popper .el-dropdown-menu__item.is-active .x-tree-tools__icon {
  color: var(--el-color-primary);
}

.x-tree-tools__divider {
  height: 1px;
  margin: 5px 4px;
  background: var(--el-border-color-lighter);
  list-style: none;
}

.x-tree-tools__submenu {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
}

.x-tree-tools__submenu-trigger {
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
  box-sizing: border-box;
  padding: 0 10px;
  border: 0;
  border-radius: 5px;
  outline: none;
  color: var(--el-text-color-regular);
  font-size: 13px;
  font-weight: 400;
  text-align: left;
  background: transparent;
  cursor: pointer;
}

.x-tree-tools__submenu:hover > .x-tree-tools__submenu-trigger,
.x-tree-tools__submenu:focus-within > .x-tree-tools__submenu-trigger,
.x-tree-tools__submenu.is-open > .x-tree-tools__submenu-trigger {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.x-tree-tools__submenu.is-selected > .x-tree-tools__submenu-trigger {
  color: var(--el-color-primary);
}

.x-tree-tools__submenu-arrow {
  flex: none;
  margin-left: auto;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.x-tree-tools__submenu:hover > .x-tree-tools__submenu-trigger .x-tree-tools__submenu-arrow,
.x-tree-tools__submenu:focus-within > .x-tree-tools__submenu-trigger .x-tree-tools__submenu-arrow,
.x-tree-tools__submenu.is-open > .x-tree-tools__submenu-trigger .x-tree-tools__submenu-arrow {
  color: var(--el-color-primary);
}

.x-tree-tools__submenu-panel {
  position: absolute;
  z-index: 1;
  top: 0;
  left: calc(100% + 12px);
  display: none;
  min-width: 210px;
  max-height: min(420px, calc(100vh - 16px));
  overflow: auto;
  box-sizing: border-box;
  padding: 6px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color-overlay, #fff);
  box-shadow: var(--el-box-shadow-light);
}

.x-tree-tools__submenu:hover > .x-tree-tools__submenu-panel,
.x-tree-tools__submenu:focus-within > .x-tree-tools__submenu-panel,
.x-tree-tools__submenu.is-open > .x-tree-tools__submenu-panel {
  display: block;
}

.x-tree-settings__title {
  box-sizing: border-box;
  padding: 5px 10px 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
  list-style: none;
}

.x-tree-settings__radio-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.x-tree-settings__radio-list .el-radio-group {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}

.x-tree-tools-popper .x-tree-settings__radio {
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  margin: 0;
  padding: 0 10px;
  overflow: hidden;
  border-radius: 5px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  font-weight: 400;
  line-height: 32px;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.x-tree-tools-popper .x-tree-settings__radio:hover,
.x-tree-tools-popper .x-tree-settings__radio:focus-visible {
  outline: none;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.x-tree-tools-popper .x-tree-settings__radio .el-radio__label {
  padding-left: 8px;
  color: inherit;
  font-size: 13px;
  font-weight: inherit;
}

.x-tree-context-menu {
  position: fixed;
  z-index: 3000;
  width: max-content;
  min-width: 200px;
  max-height: min(420px, calc(100vh - 16px));
  overflow: auto;
  box-sizing: border-box;
  padding: 6px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color-overlay, #fff);
  box-shadow: var(--el-box-shadow-light);
}

.x-tree-context-menu__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.x-tree-context-menu .rmenu,
.x-tree-context-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  height: 32px;
  margin: 0;
  padding: 0 10px;
  overflow: hidden;
  border-radius: 5px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  line-height: 32px;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.x-tree-context-menu .rmenu:hover,
.x-tree-context-menu__item:hover,
.x-tree-context-menu .rmenu:focus-visible,
.x-tree-context-menu__item:focus-visible {
  outline: none;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.x-tree-context-menu .rmenu.disabled,
.x-tree-context-menu__item.disabled {
  color: var(--el-text-color-disabled);
  background: transparent;
  cursor: not-allowed;
}

.x-tree-context-menu__icon,
.x-tree-context-menu .rmenu > i {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  margin: 0 !important;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.x-tree-context-menu .rmenu:hover > i,
.x-tree-context-menu__item:hover .x-tree-context-menu__icon {
  color: var(--el-color-primary);
}

.x-tree-context-menu .divider,
.x-tree-context-menu__divider {
  height: 1px;
  margin: 5px 4px;
  background: var(--el-border-color-lighter);
  list-style: none;
}
</style>
