<template>
  <div :class="{ 'is-search-visible': treeSetting.showSearch && searchVisible }" class="x-tree">
    <div v-if="hasTreeTools" class="x-tree__header-actions">
      <el-button
        v-if="treeSetting.showSearch"
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
        placement="bottom-start"
        popper-class="x-tree-tools-popper"
        :show-timeout="80"
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
                    :show-after="400"
                    placement="right"
                  >
                    <el-radio class="x-tree-settings__radio" value="0">
                      {{ $t('AssetScopeWithDescendants') }}
                    </el-radio>
                  </el-tooltip>
                  <el-tooltip
                    :content="$t('AssetScopeDirectHelp')"
                    :show-after="400"
                    placement="right"
                  >
                    <el-radio class="x-tree-settings__radio" value="1">
                      {{ $t('AssetScopeDirect') }}
                    </el-radio>
                  </el-tooltip>
                </el-radio-group>
              </li>
            </template>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <transition
      :duration="{ enter: 110, leave: 0 }"
      name="x-tree-search"
      @after-enter="focusSearchInput"
    >
      <div v-if="treeSetting.showSearch && searchVisible" class="x-tree__search-row">
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
      class="x-tree__body"
      @scroll.capture.passive="handleTreeAmountScroll"
    >
      <el-tree-v2
        v-if="useVirtualTree"
        :key="treeKey"
        ref="tree"
        :data="treeData"
        :default-expanded-keys="initialExpandedKeys"
        empty-text=""
        :expand-on-click-node="true"
        :filter-method="filterNode"
        :height="virtualTreeHeight"
        :item-size="30"
        :props="virtualTreeProps"
        highlight-current
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
              <el-icon class="x-tree__node-icon">
                <Folder v-if="isLeafNode(data)" />
                <FolderOpened v-else-if="node.expanded" />
                <Folder v-else />
              </el-icon>
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
              <span v-if="hasNodeAmount(data)" class="x-tree__node-amount">
                ({{ getNodeAmount(data) }})
              </span>
            </span>
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
        :lazy="treeSetting.lazyLoad"
        :load="treeSetting.lazyLoad ? loadNode : undefined"
        :props="treeProps"
        highlight-current
        node-key="id"
        @node-contextmenu="handleNodeContextMenu"
        @node-collapse="handleNodeCollapse"
        @node-drag-end="handleNodeDragEnd"
        @node-drag-start="handleNodeDragStart"
        @node-drop="handleNodeDrop"
        @node-expand="handleNodeExpand"
      >
        <template #default="{ node, data }">
          <span
            :class="{ 'is-operation-target': isOperationTarget(data) }"
            class="x-tree__node"
            :title="getNodeTitle(data)"
          >
            <button
              :aria-label="getNodeLabel(data)"
              class="x-tree__node-toggle"
              type="button"
              @click.stop="handleNodeLabelClick($event, data)"
            >
              <el-icon class="x-tree__node-icon">
                <Folder v-if="isLeafNode(data)" />
                <FolderOpened v-else-if="node.expanded" />
                <Folder v-else />
              </el-icon>
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
              <span v-if="hasNodeAmount(data)" class="x-tree__node-amount">
                ({{ getNodeAmount(data) }})
              </span>
            </span>
          </span>
        </template>
      </el-tree>

      <el-empty
        v-if="!loading && treeData.length === 0"
        :description="$t('Empty')"
        :image-size="56"
      />
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
        <slot name="rMenu" />
      </ul>
    </div>
  </div>
</template>

<script>
import axiosRetry from 'axios-retry'
import Icon from '@/components/Widgets/Icon'
import { getShowCurrentAssetValue, setShowCurrentAssetValue } from '@/utils/common/index'

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
  components: { Icon },
  props: {
    setting: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['tree-init-finish', 'url-change'],
  data() {
    return {
      treeData: [],
      normalTreeData: [],
      currentNode: null,
      loading: false,
      treeKey: 0,
      searchValue: '',
      searchVisible: false,
      searchFocusFrame: null,
      assetScope: getAssetScopeValue(this.$cookie, this.setting),
      searchMode: false,
      menuVisible: false,
      menuPosition: { x: 0, y: 0 },
      editingKey: '',
      editValue: '',
      renameSource: '',
      renameAssetsAmount: null,
      searchRequestId: 0,
      structureRequestId: 0,
      amountRequestId: 0,
      amountAbortController: null,
      amountQueue: [],
      amountQueuedIds: new Set(),
      nodeAmounts: new Map(),
      amountWorkerRunning: false,
      amountScrollFrame: null,
      amountLoadedRowEnd: 0,
      amountAllRowsScheduled: false,
      suppressExpandAmountLoading: false,
      expandedNodeIds: new Set(),
      treeNodeCount: 0,
      normalTreeNodeCount: 0,
      virtualTreeHeight: 500,
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
    treeSetting() {
      return _.merge(
        {
          showDefaultMenu: true,
          showMenu: false,
          showCreate: true,
          showDelete: true,
          showUpdate: true,
          showSearch: false,
          showCollapse: false,
          showRefresh: false,
          showAssetScope: false,
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
          operationNodeId: '',
          readOnly: false,
          nodeRowHeight: 30,
          lazyLoad: true,
          virtualThreshold: 1000,
          virtualize: true,
          menu: [],
          callback: {}
        },
        this.setting
      )
    },
    hasTreeMenuOperations() {
      return this.treeSetting.showCollapse || this.treeSetting.showRefresh
    },
    hasTreeMenu() {
      return this.hasTreeMenuOperations || this.treeSetting.showAssetScope
    },
    hasTreeTools() {
      return this.treeSetting.showSearch || this.hasTreeMenu
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
        !this.treeSetting.showAssets &&
        this.treeNodeCount >= this.treeSetting.virtualThreshold
      )
    },
    initialExpandedKeys() {
      if (!this.treeData.length) {
        return []
      }
      if (!this.searchMode) {
        if (this.$store.getters.currentOrgIsRoot) {
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
    document.addEventListener('mousedown', this.hideRMenu)
    document.addEventListener('scroll', this.hideRMenu, true)
    this.setupTreeResizeObserver()
    this.loadRoot()
  },
  beforeUnmount() {
    this.debouncedSearch?.cancel()
    this.cancelAmountLoading()
    this.removeDragPreview()
    this.treeResizeObserver?.disconnect()
    window.cancelAnimationFrame(this.treeResizeFrame)
    window.cancelAnimationFrame(this.searchFocusFrame)
    document.removeEventListener('mousedown', this.hideRMenu)
    document.removeEventListener('scroll', this.hideRMenu, true)
  },
  methods: {
    setupTreeResizeObserver() {
      const updateHeight = () => {
        window.cancelAnimationFrame(this.treeResizeFrame)
        this.treeResizeFrame = window.requestAnimationFrame(() => {
          this.treeResizeFrame = null
          const height = this.$refs.treeBody?.clientHeight || 0
          if (!height) {
            return
          }
          const nextHeight = Math.max(200, Math.round(height - 18))
          if (nextHeight !== this.virtualTreeHeight) {
            this.virtualTreeHeight = nextHeight
          }
        })
      }
      this.$nextTick(updateHeight)
      if (typeof ResizeObserver !== 'undefined') {
        this.treeResizeObserver = new ResizeObserver(updateHeight)
        this.$nextTick(() => {
          if (this.$refs.treeBody) {
            this.treeResizeObserver.observe(this.$refs.treeBody)
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
      return node?.meta?.data?.key ?? node?.id
    },
    getParentKey(node) {
      return node?.pId ?? node?.parent_key ?? node?.meta?.data?.parent_key
    },
    getNodeLabel(node) {
      return node?.name || node?.meta?.data?.value || ''
    },
    getNodeTitle(node) {
      const label = this.getNodeLabel(node)
      const amount = this.getNodeAmount(node)
      return Number.isFinite(amount) ? `${label} (${amount})` : label
    },
    isLeafNode(node) {
      return Boolean(node?._isLeaf)
    },
    getNodeAmountKey(node) {
      const nodeId =
        typeof node === 'string' || typeof node === 'number'
          ? node
          : (node?.meta?.data?.id ?? node?.id)
      return nodeId === undefined || nodeId === null ? '' : String(nodeId)
    },
    getNodeAmount(node) {
      const key = this.getNodeAmountKey(node)
      return key ? this.nodeAmounts.get(key) : undefined
    },
    hasNodeAmount(node) {
      return node?.meta?.type === 'node' && Number.isFinite(this.getNodeAmount(node))
    },
    setNodeAmount(node, amount) {
      const key = this.getNodeAmountKey(node)
      if (!key) {
        return
      }
      if (Number.isFinite(amount)) {
        this.nodeAmounts.set(key, amount)
      } else {
        this.nodeAmounts.delete(key)
      }
    },
    initializeNodeAmounts(nodes) {
      const amounts = new Map()
      const stack = [...nodes]
      while (stack.length) {
        const node = stack.pop()
        if (node.meta?.type === 'node') {
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
      this.nodeAmounts = amounts
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
        name: this.getNodeLabel(node),
        children,
        assets_amount: amount === undefined || amount === null ? null : Number(amount),
        _isLeaf: isLeaf
      }
    },
    getResponseNodes(response) {
      return Array.isArray(response) ? response : response?.results || []
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
    cancelAmountLoading() {
      this.cancelAmountScrollFrame()
      this.amountRequestId += 1
      this.amountAbortController?.abort()
      this.amountAbortController = null
      this.amountQueue = []
      this.amountQueuedIds.clear()
      this.amountWorkerRunning = false
    },
    clearNodeAmounts() {
      this.nodeAmounts.clear()
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
      return treeBody
    },
    getProgressiveAmountBatchSize() {
      return Math.max(1, Number(this.treeSetting.countProgressiveBatchSize) || 100)
    },
    collectProgressiveAmountNodes(startIndex, endIndex) {
      return this.collectExpandedTreeRows(this.treeData, endIndex).slice(startIndex, endIndex)
    },
    getTreeAmountScrollIndex(scrollElement = this.getTreeAmountScrollElement()) {
      const rowHeight = Math.max(1, Number(this.treeSetting.nodeRowHeight) || 30)
      const scrollTop = Math.max(0, Number(scrollElement?.scrollTop) || 0)
      return Math.floor(scrollTop / rowHeight)
    },
    async requestNodeAmounts(nodeIds, signal) {
      if (!nodeIds.length) {
        return { results: [] }
      }
      const includeDescendants = this.assetScope !== '1'
      if (typeof this.treeSetting.loadNodeAmounts === 'function') {
        return this.treeSetting.loadNodeAmounts(nodeIds, { includeDescendants, signal })
      }
      return this.$axios.post(
        this.treeSetting.countUrl,
        { include_descendants: includeDescendants, node_ids: nodeIds },
        { signal }
      )
    },
    enqueueNodeAmounts(nodes) {
      if (!this.treeSetting.countUrl && typeof this.treeSetting.loadNodeAmounts !== 'function') {
        return
      }
      nodes.forEach((node) => {
        const nodeId = node?.meta?.data?.id
        const queueKey = nodeId ? String(nodeId) : ''
        if (
          !queueKey ||
          node.meta?.type !== 'node' ||
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
      if (
        this.amountAllRowsScheduled ||
        (!this.treeSetting.countUrl && typeof this.treeSetting.loadNodeAmounts !== 'function')
      ) {
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
      this.enqueueNodeAmounts(nodes)
    },
    startProgressiveAmountLoading() {
      this.resetProgressiveAmountLoading()
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
      if (this.amountScrollFrame !== null) {
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
    refreshNodeAmounts(nodes) {
      if (this.assetScope === '1') {
        return
      }
      this.forceRefreshNodeAmounts(nodes)
    },
    forceRefreshNodeAmounts(nodes) {
      const uniqueNodes = []
      const nodeIds = new Set()
      nodes.forEach((node) => {
        const nodeId = node?.meta?.data?.id
        const key = nodeId ? String(nodeId) : ''
        if (!key || nodeIds.has(key)) {
          return
        }
        nodeIds.add(key)
        uniqueNodes.push(node)
      })
      if (!uniqueNodes.length) {
        return
      }

      const pendingLoadedNodes = this.collectProgressiveAmountNodes(
        0,
        this.amountLoadedRowEnd
      ).filter((node) => !Number.isFinite(this.getNodeAmount(node)))
      this.cancelAmountLoading()
      uniqueNodes.forEach((node) => {
        this.setNodeAmount(node, null)
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
        const nodeId = node?.meta?.data?.id
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
      if (this.amountWorkerRunning) {
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
          const response = await this.requestNodeAmounts(
            batch.map((node) => node.meta.data.id),
            controller.signal
          )
          if (requestId !== this.amountRequestId) {
            return
          }
          const results = Array.isArray(response) ? response : response?.results || []
          const amountMap = new Map(
            results.map((item) => [String(item.id), Number(item.assets_amount)])
          )
          batch.forEach((node) => {
            const amount = amountMap.get(String(node.meta.data.id))
            if (Number.isFinite(amount)) {
              this.setNodeAmount(node, amount)
            }
            this.amountQueuedIds.delete(String(node.meta.data.id))
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
    async requestTree(url, params = {}) {
      return this.$axios.get(url, {
        params,
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
    async loadRoot(refresh = false) {
      const requestId = ++this.structureRequestId
      this.cancelAmountLoading()
      this.resetProgressiveAmountLoading()
      const url = this.getRefreshUrl(refresh)
      const initialData = refresh ? null : this.treeSetting.initialData
      const hasInitialData = Array.isArray(initialData) && initialData.length > 0
      if (!url && !hasInitialData) {
        this.nodeAmounts.clear()
        this.treeData = []
        return
      }
      this.loading = true
      try {
        const response = hasInitialData ? initialData : await this.requestTree(url)
        const normalized = await this.normalizeTreeAsync(
          response,
          () => requestId === this.structureRequestId
        )
        if (!normalized || requestId !== this.structureRequestId) {
          return
        }
        this.initializeNodeAmounts(normalized.roots)
        this.normalTreeData = normalized.roots
        this.treeData = this.normalTreeData
        this.treeNodeCount = normalized.count
        this.normalTreeNodeCount = normalized.count
        this.searchMode = false
        this.treeKey += 1
        await this.$nextTick()
        await this.expandInitialNodes()
        this.$emit('tree-init-finish', this)
        this.startProgressiveAmountLoading()
      } finally {
        if (requestId === this.structureRequestId) {
          this.loading = false
        }
      }
    },
    async expandInitialNodes() {
      this.suppressExpandAmountLoading = true
      try {
        this.expandedNodeIds.clear()
        if (this.useVirtualTree) {
          const keys = this.initialExpandedKeys
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
        const keys = this.initialExpandedKeys
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
      const container = this.$refs.treeBody
      const element = container?.querySelector('.x-tree__node.is-operation-target')
      if (!container || !element) {
        return
      }
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      container.scrollTop +=
        elementRect.top - containerRect.top - (containerRect.height - elementRect.height) / 2
    },
    async loadNode(node, resolve) {
      if (node.level === 0) {
        resolve(this.treeData)
        return
      }
      if (node.data?.children?.length || node.data?._isLeaf) {
        resolve(node.data?.children || [])
        return
      }
      try {
        const response = await this.requestTree(this.treeSetting.treeUrl, {
          key: node.data.id,
          n: node.data.name,
          lv: node.level
        })
        const children = this.normalizeTree(response)
        resolve(children)
      } catch (error) {
        resolve([])
      }
    },
    async handleNodeExpand(data, node) {
      if (data?.id !== undefined && data?.id !== null) {
        this.expandedNodeIds.add(String(data.id))
      }
      if (this.suppressExpandAmountLoading) {
        return
      }
      await this.$nextTick()
      const children = data?.children?.length
        ? data.children
        : (node?.childNodes || []).map((child) => child.data)
      this.enqueueNodeAmounts(children)
    },
    handleNodeCollapse(data) {
      if (data?.id !== undefined && data?.id !== null) {
        this.expandedNodeIds.delete(String(data.id))
      }
    },
    collapseTreeStepwise() {
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
      const nextExpandedKeys =
        this.$store.getters.currentOrgIsRoot || isFirstLevelState ? [] : firstLevelKeys

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

      if (nextExpandedKeys.length) {
        const children = this.treeData.flatMap((node) => node.children || [])
        this.enqueueNodeAmounts(children)
      }
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
      this.$nextTick(() => {
        window.cancelAnimationFrame(this.searchFocusFrame)
        this.searchFocusFrame = window.requestAnimationFrame(() => {
          this.searchFocusFrame = null
          const input = this.$refs.searchInput
          input?.focus?.()
          const nativeInput = input?.input || input?.$el?.querySelector?.('input')
          nativeInput?.focus?.({ preventScroll: true })
        })
      })
    },
    async filterTreeLocally(keyword, isCurrent) {
      const query = keyword.toLocaleLowerCase()
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
          matches: this.getNodeLabel(node).toLocaleLowerCase().includes(query),
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
    async searchTree(keyword) {
      const requestId = ++this.searchRequestId
      this.cancelAmountLoading()
      if (!keyword) {
        this.searchMode = false
        this.treeData = this.normalTreeData
        this.treeNodeCount = this.normalTreeNodeCount
        this.treeKey += 1
        await this.$nextTick()
        await this.expandInitialNodes()
        this.startProgressiveAmountLoading()
        return
      }

      const filtered = await this.filterTreeLocally(
        keyword,
        () => requestId === this.searchRequestId
      )
      if (!filtered || requestId !== this.searchRequestId) {
        return
      }
      this.searchMode = true
      this.treeData = filtered.roots
      this.treeNodeCount = filtered.count
      this.treeKey += 1
      await this.$nextTick()
      await this.expandInitialNodes()
      this.startProgressiveAmountLoading()
    },
    async refresh() {
      this.hideRMenu()
      this.searchValue = ''
      this.searchRequestId += 1
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
      this.cancelAmountLoading()
      this.clearNodeAmounts()
      this.startProgressiveAmountLoading()
      this.treeSetting.callback?.onAssetScopeChange?.(this.assetScope, this.currentNode)
      if (this.currentNode) {
        this.handleNodeLabelClick(null, this.currentNode)
      }
    },
    handleNodeLabelClick(event, data) {
      this.currentNode = data
      this.$refs.tree?.setCurrentKey(data.id)
      const onSelected = this.treeSetting.callback?.onSelected
      if (onSelected) {
        onSelected(event, data, { assetScope: this.assetScope })
      } else {
        this.emitSelectedUrl(data)
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
        const response = await this.$axios.post(url, {})
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
          this.appendRawTreeNode(parent, node)
          this.appendNodeToNormalTreeWhenSearching(parent, node)
          this.treeNodeCount += 1
          this.normalTreeNodeCount += 1
          // Rebuild only el-tree-v2's local flattened index. Calling loadRoot
          // here caused an unnecessary API request and reset the whole tree.
          this.$refs.tree?.setData(this.treeData)
          await this.activateCreatedNode(parent, node)
          return
        }
        this.$refs.tree?.append(node, parent)
        this.setTreeNodeLeafState(node, true)
        this.setTreeNodeLeafState(this.$refs.tree?.getNode(parent.id) || parent, false)
        this.appendNodeToNormalTreeWhenSearching(parent, node)
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
        const response = await this.$axios.patch(
          `${this.treeSetting.nodeUrl}${node.meta.data.id}/`,
          { value }
        )
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
      await this.$axios.delete(`${this.treeSetting.nodeUrl}${node.meta.data.id}/`)

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
        await this.$axios.put(
          `${this.treeSetting.nodeUrl}${dropNode.data.meta.data.id}/children/add/`,
          { nodes: [draggingNode.data.meta.data.id] }
        )
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
    getNodes() {
      return this.treeData
    },
    getAllNodes() {
      return this.normalTreeData
    },
    getTreeSnapshot() {
      return {
        nodes: this.normalTreeData,
        amounts: Object.fromEntries(this.nodeAmounts),
        assetScope: this.assetScope
      }
    },
    appendRawTreeNode(parent, node) {
      parent.children ||= []
      if (!parent.children.some((item) => String(item.id) === String(node.id))) {
        parent.children.push(node)
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
    appendNodeToNormalTreeWhenSearching(parent, node) {
      if (!this.searchMode) {
        return
      }
      const normalParent = this.findTreeNodeIn(this.normalTreeData, parent.id)
      if (normalParent && normalParent !== parent) {
        this.appendRawTreeNode(normalParent, node)
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
.x-tree {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 204px);
  min-height: 360px;
  background: var(--el-bg-color, #fff);
}

.x-tree__header-actions {
  position: absolute;
  z-index: 4;
  top: 5px;
  right: 8px;
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 1px;
}

.x-tree__search-row {
  flex: none;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.x-tree-search-enter-active {
  will-change: opacity, transform;
  transition:
    opacity 0.11s ease-out,
    transform 0.11s cubic-bezier(0.22, 1, 0.36, 1);
}

.x-tree-search-enter-from {
  opacity: 0;
  transform: translate3d(0, -4px, 0);
}

.x-tree__search {
  box-sizing: border-box;
  flex: 1;
  height: 30px;
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  outline: none;
  background-color: var(--el-bg-color, #fff);
  box-shadow: none;
  transition: none;

  &:hover,
  &:focus,
  &:focus-visible,
  &:focus-within {
    border-color: var(--color-border) !important;
    outline: none;
    box-shadow: none !important;
  }

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

.x-tree__tool-button {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  width: 30px;
  height: 30px;
  padding: 5px;
  border: none !important;
  border-radius: 4px;
  color: var(--color-text-primary);
  background-color: transparent;
}

.x-tree__tool-button:focus,
.x-tree__tool-button:focus-visible {
  border: none !important;
  outline: none;
  box-shadow: none !important;
  color: var(--color-text-primary);
  background-color: transparent;
}

.x-tree__tool-button:hover {
  border: none !important;
  box-shadow: none !important;
  color: var(--color-text-primary);
  background-color: rgba(0, 0, 0, 0.05);
}

.x-tree__tool-button.is-active {
  background-color: rgba(0, 0, 0, 0.05);
}

.x-tree__tool-icon {
  width: 13px;
  height: 13px;
  margin: 0;
  font-size: 13px;
}

.x-tree__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 6px 8px 12px;
  border-top: 1px solid var(--el-border-color-lighter);

  &::-webkit-scrollbar:horizontal {
    display: none;
    height: 0;
  }
}

.x-tree.is-search-visible .x-tree__body {
  border-top: 0;
}

.x-tree__body.is-virtual {
  overflow: hidden;
}

.x-tree__body.is-virtual :deep(.el-tree-virtual-list) {
  min-width: 100%;
  overflow-x: auto !important;
}

.x-tree__body.is-virtual :deep(.el-tree-virtual-list)::-webkit-scrollbar:horizontal {
  display: none;
  height: 0;
}

.x-tree__body.is-virtual :deep(.el-scrollbar__bar.is-horizontal) {
  display: none;
}

.x-tree__body :deep(.el-tree) {
  min-width: max-content;
  background: transparent;
  color: var(--el-text-color-regular);
}

.x-tree__body :deep(.el-tree-node__content) {
  height: 30px;
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
  color: var(--el-text-color-secondary);
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
  padding: 0;
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
