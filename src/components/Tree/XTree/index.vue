<template>
  <div class="x-tree">
    <div v-if="treeSetting.showSearch || treeSetting.showRefresh" class="x-tree__toolbar">
      <el-input
        v-if="treeSetting.showSearch"
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
      <el-tooltip
        v-if="treeSetting.showRefresh"
        :content="$t('Refresh')"
        :show-after="500"
        placement="top"
      >
        <el-button
          :aria-label="$t('Refresh')"
          :disabled="loading"
          :title="$t('Refresh')"
          class="x-tree__refresh"
          @click="refresh"
        >
          <svg-icon
            :class="{ 'is-loading': loading }"
            class="x-tree__refresh-icon"
            icon-class="refresh"
          />
        </el-button>
      </el-tooltip>
    </div>

    <div v-loading="loading" class="x-tree__body">
      <el-tree
        :key="treeKey"
        ref="tree"
        :allow-drag="allowDrag"
        :allow-drop="allowDrop"
        :data="treeData"
        :draggable="canMove"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        :load="loadNode"
        :props="treeProps"
        highlight-current
        lazy
        node-key="id"
        @node-contextmenu="handleNodeContextMenu"
        @node-drop="handleNodeDrop"
      >
        <template #default="{ node, data }">
          <span class="x-tree__node" :title="getNodeLabel(data)">
            <button
              v-if="!isLeafNode(data)"
              :aria-label="node.expanded ? $t('CollapseNode') : $t('ExpandNode')"
              class="x-tree__node-toggle"
              type="button"
              @click.stop="handleNodeToggle(node, data)"
            >
              <el-icon class="x-tree__node-icon">
                <Document v-if="isLeafNode(data)" />
                <FolderOpened v-else-if="node.expanded" />
                <Folder v-else />
              </el-icon>
            </button>
            <span v-else class="x-tree__node-toggle x-tree__node-toggle--leaf">
              <el-icon class="x-tree__node-icon">
                <Document />
              </el-icon>
            </span>
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
      class="modern-tree-context-menu"
      @contextmenu.prevent
      @mousedown.stop
    >
      <ul class="modern-tree-context-menu__list">
        <template v-for="item in menu" :key="item.id">
          <li
            v-if="hasMenuItem(item)"
            :id="item.id"
            :class="{ disabled: checkDisabled(item) }"
            class="rmenu modern-tree-context-menu__item"
            tabindex="-1"
            @click="handleMenuItemClick(item)"
          >
            <Icon :icon="item.icon" class="modern-tree-context-menu__icon" />
            {{ item.name }}
          </li>
          <li v-if="item.divided" class="divider modern-tree-context-menu__divider" />
        </template>
        <slot name="rMenu" />
      </ul>
    </div>
  </div>
</template>

<script>
import axiosRetry from 'axios-retry'
import Icon from '@/components/Widgets/Icon'
import { getShowCurrentAssetValue } from '@/utils/common/index'

function appendUrlParam(url, key, value) {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`
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
      searchMode: false,
      menuVisible: false,
      menuPosition: { x: 0, y: 0 },
      editingKey: '',
      editValue: '',
      renameSource: '',
      renameAssetsAmount: null,
      searchRequestId: 0,
      treeProps: {
        children: 'children',
        label: 'name',
        isLeaf: '_isLeaf'
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
          showRefresh: false,
          hasRightMenu: true,
          selectSyncToRoute: true,
          menu: [],
          callback: {}
        },
        this.setting
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
      return !this.searchMode && this.treeSetting.edit?.drag?.isMove !== false
    },
    menuStyle() {
      return {
        left: `${this.menuPosition.x}px`,
        top: `${this.menuPosition.y}px`
      }
    }
  },
  created() {
    this.debouncedSearch = _.debounce(this.searchTree, 500)
  },
  mounted() {
    document.addEventListener('mousedown', this.hideRMenu)
    document.addEventListener('scroll', this.hideRMenu, true)
    this.loadRoot()
  },
  beforeUnmount() {
    this.debouncedSearch?.cancel()
    document.removeEventListener('mousedown', this.hideRMenu)
    document.removeEventListener('scroll', this.hideRMenu, true)
  },
  methods: {
    getNodeKey(node) {
      return node?.meta?.data?.key ?? node?.id
    },
    getParentKey(node) {
      return node?.pId ?? node?.parent_key ?? node?.meta?.data?.parent_key
    },
    getNodeLabel(node) {
      return node?.name || node?.meta?.data?.value || ''
    },
    isLeafNode(node) {
      return Boolean(node?._isLeaf)
    },
    handleNodeToggle(node, data) {
      if (!node || this.isLeafNode(data)) {
        return
      }
      if (node.expanded) {
        node.collapse()
      } else {
        node.expand()
      }
    },
    normalizeNode(node) {
      const children = (node.children || []).map((child) => this.normalizeNode(child))
      const type = node.meta?.type
      const hasChildren = node.hasChildren ?? node.meta?.data?.has_children
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
        _isLeaf: isLeaf
      }
    },
    normalizeTree(response) {
      const nodes = Array.isArray(response) ? response : response?.results || []
      if (nodes.some((node) => node.children?.length)) {
        return nodes.map((node) => this.normalizeNode(node))
      }

      const normalized = nodes.map((node) => this.normalizeNode(node))
      const nodeMap = new Map()
      normalized.forEach((node) => nodeMap.set(String(node.id), node))
      const roots = []
      normalized.forEach((node) => {
        const parent = nodeMap.get(String(this.getParentKey(node)))
        if (parent && parent !== node) {
          parent.children.push(node)
          parent._isLeaf = false
        } else {
          roots.push(node)
        }
      })
      return roots
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
      const url = this.treeSetting.treeUrl || ''
      if (refresh && url.includes('/perms/') && !url.includes('rebuild_tree')) {
        return appendUrlParam(url, 'rebuild_tree', 1)
      }
      return url
    },
    async loadRoot(refresh = false) {
      const url = this.getRefreshUrl(refresh)
      if (!url) {
        this.treeData = []
        return
      }
      this.loading = true
      try {
        const response = await this.requestTree(url)
        this.normalTreeData = this.normalizeTree(response)
        this.treeData = this.normalTreeData
        this.searchMode = false
        this.treeKey += 1
        await this.$nextTick()
        this.expandInitialNodes()
        this.$emit('tree-init-finish', this)
      } finally {
        this.loading = false
      }
    },
    expandInitialNodes() {
      if (this.searchMode) {
        const expandAll = (nodes) => {
          nodes.forEach((item) => {
            if (item.children?.length) {
              this.$refs.tree?.getNode(item.id)?.expand()
              expandAll(item.children)
            }
          })
        }
        expandAll(this.treeData)
        return
      }
      const firstRoot = this.treeData[0]
      const keys = this.treeData.filter((node) => node.open).map((node) => node.id)
      if (firstRoot && keys.length === 0) {
        keys.push(firstRoot.id)
      }
      keys.forEach((key) => this.$refs.tree?.getNode(key)?.expand())
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
        resolve(this.normalizeTree(response))
      } catch (error) {
        resolve([])
      }
    },
    filterNode(query, node) {
      return this.getNodeLabel(node).toLocaleLowerCase().includes(query.toLocaleLowerCase())
    },
    handleSearchInput(value) {
      this.debouncedSearch(value.trim())
    },
    async searchTree(keyword) {
      const requestId = ++this.searchRequestId
      if (!keyword) {
        this.searchMode = false
        this.treeData = this.normalTreeData
        this.treeKey += 1
        await this.$nextTick()
        this.expandInitialNodes()
        return
      }

      this.loading = true
      try {
        let url = this.treeSetting.searchUrl || this.treeSetting.treeUrl
        if (url.includes('assets/nodes/children/tree') && !url.includes('all=')) {
          url = appendUrlParam(url, 'all', 'all')
        }
        url = appendUrlParam(url, 'search', keyword)
        const response = await this.requestTree(url)
        if (requestId !== this.searchRequestId) {
          return
        }
        const results = this.normalizeTree(response)
        this.searchMode = true
        this.treeData = results.length
          ? [
              {
                id: '__modern_tree_search__',
                name: `${this.$t('Search')} (${Array.isArray(response) ? response.length : results.length})`,
                meta: { type: 'search' },
                children: results,
                _isLeaf: false,
                open: true
              }
            ]
          : []
        this.treeKey += 1
        await this.$nextTick()
        this.expandInitialNodes()
      } finally {
        if (requestId === this.searchRequestId) {
          this.loading = false
        }
      }
    },
    async refresh() {
      this.hideRMenu()
      this.searchValue = ''
      this.searchRequestId += 1
      this.treeSetting.callback?.beforeRefresh?.()
      await this.treeSetting.callback?.refresh?.()
      await this.loadRoot(true)
    },
    handleNodeLabelClick(event, data) {
      if (data.meta?.type === 'search') {
        return
      }
      this.currentNode = data
      this.$refs.tree?.setCurrentKey(data.id)
      const onSelected = this.treeSetting.callback?.onSelected
      if (onSelected) {
        onSelected(event, data)
      } else {
        this.emitSelectedUrl(data)
      }
    },
    emitSelectedUrl(treeNode) {
      if (!this.treeSetting.url) {
        return
      }
      const separator = this.treeSetting.url.includes('?') ? '&' : '?'
      const showCurrentAsset = getShowCurrentAssetValue(this.$cookie)
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
          isParent: true,
          meta: { data: response, type: 'node' }
        })
        this.$refs.tree?.append(node, parent)
        this.currentNode = node
        this.$refs.tree?.setCurrentKey(node.id)
        this.$message.success(this.$tc('CreateSuccessMsg'))
        this.$nextTick(() => this.startRename(node))
      } catch (error) {
        this.$message.error(`${this.$tc('CreateErrorMsg')} ${error}`)
      }
    },
    startRename(node = this.currentNode) {
      if (!node) {
        return
      }
      const match = this.getNodeLabel(node).match(/^(.+?)\s*\((\d+)\)$/)
      this.currentNode = node
      this.editingKey = String(node.id)
      this.renameSource = node.meta?.data?.value || match?.[1] || this.getNodeLabel(node)
      this.renameAssetsAmount = match ? Number(match[2]) : null
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
        node.name =
          this.renameAssetsAmount === null ? value : `${value} (${this.renameAssetsAmount})`
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
      await this.$axios.delete(`${this.treeSetting.nodeUrl}${node.meta.data.id}/`)
      this.$refs.tree?.remove(node)
      this.currentNode = null
      this.$message.success(this.$tc('DeleteSuccessMsg'))
    },
    allowDrag(node) {
      return this.canMove && node.data?.meta?.type === 'node' && node.data.id !== '-12'
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
      if (type !== 'inner') {
        await this.loadRoot()
        return
      }
      const confirmed = window.confirm(
        this.$t('DropConfirmMsg', {
          src: this.getNodeLabel(draggingNode.data),
          dst: this.getNodeLabel(dropNode.data)
        })
      )
      if (!confirmed) {
        await this.loadRoot()
        return
      }
      try {
        await this.$axios.put(
          `${this.treeSetting.nodeUrl}${dropNode.data.meta.data.id}/children/add/`,
          { nodes: [draggingNode.data.meta.data.id] }
        )
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      } catch (error) {
        await this.loadRoot()
        this.$message.error(`${this.$tc('UpdateErrorMsg')} ${error}`)
      }
    },
    getSelectedNodes() {
      return this.currentNode ? [this.currentNode] : []
    },
    getNodes() {
      return this.treeData
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

.x-tree__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.x-tree__search {
  flex: 1;
}

.x-tree__refresh {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  width: 30px;
  height: 30px;
  margin-left: auto;
  padding: 7px;
  border: none;
  color: var(--color-text-primary);
  background-color: transparent;
}

.x-tree__refresh:hover,
.x-tree__refresh:focus-visible {
  color: var(--color-text-primary);
  background-color: rgba(0, 0, 0, 0.05);
}

.x-tree__refresh.is-disabled {
  color: var(--color-text-primary);
  background-color: transparent;
  opacity: 0.65;
}

.x-tree__refresh-icon {
  width: 13px;
  height: 13px;
  margin: 0;
  font-size: 13px;
}

.x-tree__refresh-icon.is-loading {
  animation: x-tree-refresh-rotate 1s linear infinite;
}

@keyframes x-tree-refresh-rotate {
  to {
    transform: rotate(360deg);
  }
}

.x-tree__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 6px 8px 12px;
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
}

.x-tree__body :deep(.el-tree-node__content:hover) {
  background: var(--el-fill-color-light);
}

.x-tree__body :deep(.el-tree-node.is-current > .el-tree-node__content) {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.x-tree__body :deep(.el-tree-node__expand-icon) {
  color: var(--el-text-color-secondary);
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

.x-tree__node-toggle--leaf {
  cursor: default;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.x-tree__rename {
  width: 180px;
}

.x-tree__body :deep(.el-empty) {
  padding-top: 80px;
}
</style>

<style lang="scss">
.modern-tree-context-menu {
  position: fixed;
  z-index: 3000;
  min-width: 176px;
  max-height: min(420px, calc(100vh - 16px));
  overflow: auto;
  padding: 4px 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-bg-color-overlay, #fff);
  box-shadow: var(--el-box-shadow-light);
}

.modern-tree-context-menu__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.modern-tree-context-menu .rmenu,
.modern-tree-context-menu__item {
  display: flex;
  align-items: center;
  height: 30px;
  margin: 0;
  padding: 0 14px;
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 30px;
  white-space: nowrap;
  cursor: pointer;
}

.modern-tree-context-menu .rmenu:hover,
.modern-tree-context-menu__item:hover {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.modern-tree-context-menu .rmenu.disabled,
.modern-tree-context-menu__item.disabled {
  color: var(--el-text-color-disabled);
  cursor: not-allowed;
}

.modern-tree-context-menu__icon,
.modern-tree-context-menu .rmenu > i {
  width: 18px;
  margin-right: 4px;
  text-align: center;
}

.modern-tree-context-menu .divider,
.modern-tree-context-menu__divider {
  height: 1px;
  margin: 4px 0;
  background: var(--el-border-color-lighter);
  list-style: none;
}
</style>
