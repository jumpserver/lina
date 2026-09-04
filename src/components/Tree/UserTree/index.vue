<template>
  <div
    :style="treeStyle"
    :class="{
      'is-fill-height': treeSetting.fillHeight,
      'is-search-visible': treeSetting.showSearch && searchVisible
    }"
    class="user-tree"
  >
    <div v-if="hasHeaderActions" class="user-tree__header-actions">
      <el-button
        v-if="treeSetting.showSearch"
        :aria-label="$t('TreeActionSearch')"
        :class="{ 'is-active': searchVisible }"
        class="user-tree__tool-button"
        @click="toggleSearch"
      >
        <el-icon class="user-tree__tool-icon"><Search /></el-icon>
      </el-button>

      <el-dropdown
        v-if="hasToolsMenu"
        ref="toolsDropdown"
        :hide-timeout="200"
        placement="bottom-start"
        popper-class="x-tree-tools-popper user-tree-tools-popper"
        :show-timeout="80"
        trigger="hover"
        @command="handleToolCommand"
      >
        <el-button :aria-label="$t('TreeActions')" class="user-tree__tool-button">
          <el-icon class="user-tree__tool-icon"><More /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu class="x-tree-tools__menu">
            <el-dropdown-item v-if="treeSetting.showCollapse" command="collapse">
              <span class="x-tree-tools__icon">
                <svg-icon icon-class="tree-collapse-all" />
              </span>
              <span>{{ $t('TreeActionCollapse') }}</span>
            </el-dropdown-item>
            <el-dropdown-item v-if="treeSetting.showRefresh" command="refresh">
              <span class="x-tree-tools__icon">
                <svg-icon icon-class="refresh" />
              </span>
              <span>{{ $t('Refresh') }}</span>
            </el-dropdown-item>

            <template v-if="treeSetting.showPermissionScope">
              <li v-if="hasToolOperations" class="x-tree-tools__divider" />
              <li class="x-tree-settings__title">{{ $t('PermissionScope') }}</li>
              <li class="x-tree-settings__radio-list" @click.capture="closeToolsDropdown">
                <el-radio-group
                  :model-value="permissionScope"
                  @change="handlePermissionScopeChange"
                >
                  <el-radio
                    v-for="option in permissionScopeOptions"
                    :key="option.value"
                    :value="option.value"
                    class="x-tree-settings__radio"
                  >
                    {{ option.label }}
                  </el-radio>
                </el-radio-group>
              </li>
            </template>

            <template v-if="treeSetting.showUserOrder">
              <li
                v-if="hasToolOperations || treeSetting.showPermissionScope"
                class="x-tree-tools__divider"
              />
              <li class="x-tree-settings__title">{{ $t('UserTreeSort') }}</li>
              <li class="x-tree-settings__radio-list" @click.capture="closeToolsDropdown">
                <el-radio-group :model-value="userOrder" @change="handleUserOrderChange">
                  <el-radio
                    v-for="option in userOrderOptions"
                    :key="option.value"
                    :value="option.value"
                    class="x-tree-settings__radio"
                  >
                    {{ option.label }}
                  </el-radio>
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
      <div v-if="treeSetting.showSearch && searchVisible" class="user-tree__search-row">
        <el-input
          ref="searchInput"
          v-model="searchKeyword"
          :placeholder="$t('UserTreeSearchPlaceholder')"
          class="user-tree__search-control"
          clearable
          @input="handleSearchInput"
          @keydown.enter.prevent="handleSearchEnter"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </transition>

    <XTree
      ref="tree"
      :setting="xTreeSetting"
      @tree-init-finish="$emit('tree-init-finish', $event)"
      @url-change="$emit('url-change', $event)"
    >
      <template #node-icon="{ data, expanded, leaf }">
        <Icon
          v-if="getResourceType(data) === 'user'"
          icon="fa-user"
          class="user-tree__resource-icon"
        />
        <Icon
          v-else-if="getResourceType(data) === 'load_more'"
          icon="fa-ellipsis-h"
          class="user-tree__resource-icon"
        />
        <TreeFolderIcon v-else :expanded="expanded" :leaf="leaf" class="user-tree__resource-icon" />
      </template>
      <template #rMenu="slotProps">
        <slot name="rMenu" v-bind="slotProps" />
      </template>
    </XTree>
  </div>
</template>

<script>
import Icon from '@/components/Widgets/Icon'
import TreeFolderIcon from '@/components/Tree/TreeFolderIcon.vue'
import XTree from '@/components/Tree/XTree/index.vue'
import { createXTreeSetting, X_TREE_LOAD_MODES } from '@/components/Tree/XTree/config'
import {
  isUserTreeOrder,
  normalizeUserTreeResponse,
  toUserTreeResource,
  USER_TREE_ORDER_VALUES
} from './provider'

const SETTINGS_CACHE_PREFIX = 'jms.user-tree.settings.'
const PERMISSION_SCOPES = Object.freeze(['direct', 'effective'])
const METRIC_RESOURCE_TYPES = Object.freeze(['organization', 'user_group', 'user'])
const LOAD_MORE_RESOURCE_TYPE = 'load_more'

function getSettingsCacheKey(setting = {}) {
  const key = String(setting.settingsCacheKey || '').trim()
  return key ? `${SETTINGS_CACHE_PREFIX}${key}` : ''
}

function readCachedSettings(setting) {
  const key = getSettingsCacheKey(setting)
  if (!key || typeof window === 'undefined') {
    return {}
  }
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

function writeCachedSettings(setting, value) {
  const key = getSettingsCacheKey(setting)
  if (!key || typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Browser storage may be disabled; the current in-memory settings remain valid.
  }
}

function responseResults(response) {
  if (Array.isArray(response)) {
    return response
  }
  return response?.results || response?.tree || []
}

function responseWithResults(response, results) {
  return Array.isArray(response) ? results : { ...response, results }
}

function metricResources(nodes) {
  const seen = new Set()
  const resources = []
  for (const node of nodes || []) {
    const resource = toUserTreeResource(node)
    const key = `${resource.type}:${resource.resourceId}`
    if (!resource.resourceId || !METRIC_RESOURCE_TYPES.includes(resource.type) || seen.has(key)) {
      continue
    }
    seen.add(key)
    resources.push(resource)
  }
  return resources
}

function markSearchChildrenProjections(response) {
  const roots = responseResults(response)
  const nodes = []
  const parentIds = new Set()
  const stack = [...roots]
  while (stack.length) {
    const node = stack.pop()
    nodes.push(node)
    if (node?.pId !== undefined && node?.pId !== null && node.pId !== '') {
      parentIds.add(String(node.pId))
    }
    if (node?.children?.length) {
      parentIds.add(String(node.id))
      stack.push(...node.children)
    }
  }
  nodes.forEach((node) => {
    if (parentIds.has(String(node?.id)) && toUserTreeResource(node).type !== 'user') {
      node._childrenProjection = true
      node._reloadProjectedChildren = false
    }
  })
  return response
}

/**
 * Reusable organization -> user group/user tree. Users without a group are
 * direct children of the organization root.
 *
 * The component is endpoint-agnostic. Its data source may implement:
 *
 * - root({ refresh, order, signal })
 * - children({ parent, level, limit, offset, order, signal })
 * - search({ keyword, limit, order, signal })
 * - metrics({ fresh, items, metric, mode, nodes, signal })
 *
 * Nodes use the neutral XTree shape. User occurrences may have composite UI
 * IDs, while their stable UUID remains in `meta.data.resource_id`.
 */
export default {
  name: 'UserTree',
  components: { Icon, TreeFolderIcon, XTree },
  props: {
    dataSource: {
      type: Object,
      default: null
    },
    setting: {
      type: Object,
      default: () => ({})
    }
  },
  emits: [
    'children-truncated',
    'metric-change',
    'permission-scope-change',
    'search-state-change',
    'select',
    'selected',
    'selection-clear',
    'sort-change',
    'tree-init-finish',
    'url-change'
  ],
  data() {
    const cached = readCachedSettings(this.setting)
    const configuredScope = PERMISSION_SCOPES.includes(this.setting.defaultPermissionScope)
      ? this.setting.defaultPermissionScope
      : 'effective'
    const permissionScope = PERMISSION_SCOPES.includes(cached.permissionScope)
      ? cached.permissionScope
      : configuredScope
    const configuredOrder = isUserTreeOrder(this.setting.defaultUserOrder)
      ? this.setting.defaultUserOrder
      : 'name'
    const userOrder = isUserTreeOrder(cached.userOrder) ? cached.userOrder : configuredOrder
    return {
      childTruncations: [],
      loadingMoreNodeIds: new Set(),
      permissionScope,
      searchFocusFrame: null,
      searchKeyword: '',
      searchState: { active: false, truncated: false },
      searchVisible: false,
      userOrder
    }
  },
  computed: {
    treeSetting() {
      return createXTreeSetting({
        showCollapse: true,
        showPermissionScope: true,
        showRefresh: true,
        showSearch: true,
        showUserOrder: true,
        fillHeight: true,
        height: '100%',
        minHeight: '360px',
        childrenLimit: 1000,
        searchLimit: 1000,
        ...this.setting,
        loadMode: this.setting.loadMode || X_TREE_LOAD_MODES.LAZY
      })
    },
    provider() {
      return this.dataSource || this.treeSetting.dataSource || {}
    },
    effectiveMetricMode() {
      return this.permissionScope === 'direct' ? 'permission_direct' : 'permission_effective'
    },
    permissionScopeOptions() {
      return [
        { label: this.$t('PermissionScopeEffective'), value: 'effective' },
        { label: this.$t('PermissionScopeDirect'), value: 'direct' }
      ]
    },
    userOrderOptions() {
      return USER_TREE_ORDER_VALUES.map((value) => ({
        label: this.$t(value === 'username' ? 'Username' : 'Name'),
        value
      }))
    },
    hasToolOperations() {
      return this.treeSetting.showCollapse || this.treeSetting.showRefresh
    },
    hasToolsMenu() {
      return (
        this.hasToolOperations ||
        this.treeSetting.showPermissionScope ||
        this.treeSetting.showUserOrder
      )
    },
    hasHeaderActions() {
      return this.treeSetting.showSearch || this.hasToolsMenu
    },
    treeStyle() {
      const toCssSize = (value, fallback) => {
        if (typeof value === 'number') {
          return `${value}px`
        }
        return value || fallback
      }
      return {
        '--user-tree-height': toCssSize(this.treeSetting.height, '100%'),
        '--user-tree-min-height': toCssSize(this.treeSetting.minHeight, '360px')
      }
    },
    xTreeSetting() {
      const normalizedInitialData = Array.isArray(this.treeSetting.initialData)
        ? responseResults(normalizeUserTreeResponse(this.treeSetting.initialData))
        : null
      return {
        ...this.treeSetting,
        amountPredicate: this.shouldHandleAmount,
        amountTypes: METRIC_RESOURCE_TYPES,
        callback: {
          ...this.treeSetting.callback,
          onSearchStateChange: this.handleSearchStateChange,
          onSelected: this.handleSelected
        },
        beforeNodeSelect: this.beforeNodeSelect,
        dataSource: undefined,
        getAmountKey: (node) => {
          const resource = toUserTreeResource(node)
          return resource.resourceId ? `${resource.type}:${resource.resourceId}` : ''
        },
        getAmountResultKey: (item) => {
          const id = item?.id ?? item?.resource_id
          if (id === undefined || id === null) {
            return ''
          }
          const hasType = Boolean(item?.type || item?.meta?.type)
          if (!hasType) {
            return String(id)
          }
          const resource = toUserTreeResource(item)
          return resource.resourceId === undefined || resource.resourceId === null
            ? ''
            : `${resource.type}:${resource.resourceId}`
        },
        getNodeAmountResourceId: (node) => toUserTreeResource(node).resourceId,
        getNodeAmountTitle: this.getMetricAmountTitle,
        getNodeKey: (node) => node?.meta?.data?.tree_id ?? node?.id,
        getNodeLabel: this.getResourceLabel,
        initialData: normalizedInitialData,
        lazyLoad: true,
        loadChildren: this.loadChildren,
        loadNodeAmounts: typeof this.provider.metrics === 'function' ? this.loadMetrics : undefined,
        loadRoot: this.loadRoot,
        readOnly: true,
        search: typeof this.provider.search === 'function' ? this.search : undefined,
        selectPredicate: (node) => toUserTreeResource(node).type !== LOAD_MORE_RESOURCE_TYPE,
        showAssetScope: false,
        // Regular ElTree is required because TreeV2 does not provide a lazy-load hook.
        showAssets: true,
        showCollapse: false,
        showRefresh: false,
        showSearch: false,
        virtualizeSearch: false
      }
    }
  },
  created() {
    this.debouncedSearch = _.debounce(this.searchNow, 250)
    this.loadMoreAbortControllers = new Map()
  },
  deactivated() {
    this.debouncedSearch?.cancel()
    this.cancelLoadMoreRequests()
    window.cancelAnimationFrame(this.searchFocusFrame)
    this.searchFocusFrame = null
    this.$refs.toolsDropdown?.handleClose?.()
  },
  beforeUnmount() {
    this.debouncedSearch?.cancel()
    this.cancelLoadMoreRequests()
    window.cancelAnimationFrame(this.searchFocusFrame)
  },
  methods: {
    async loadRoot(payload) {
      if (typeof this.provider.root !== 'function') {
        return []
      }
      const response = await this.provider.root({
        ...payload,
        order: this.userOrder
      })
      return normalizeUserTreeResponse(response)
    },
    async loadChildren({ level, parent, signal }) {
      if (typeof this.provider.children !== 'function') {
        return []
      }
      const resource = toUserTreeResource(parent)
      const response = await this.provider.children({
        level,
        limit: this.treeSetting.childrenLimit,
        offset: 0,
        order: this.userOrder,
        parent: resource,
        signal
      })
      this.updateChildTruncation(parent, resource, response)
      return this.withLoadMoreNode(parent, resource, response, 0)
    },
    async search({ keyword, limit, signal }) {
      if (typeof this.provider.search !== 'function') {
        return []
      }
      const boundedLimit = Math.min(Math.max(1, Number(limit) || 1000), 1000)
      const response = await this.provider.search({
        keyword,
        limit: boundedLimit,
        order: this.userOrder,
        signal
      })
      return markSearchChildrenProjections(normalizeUserTreeResponse(response))
    },
    async loadMetrics(nodeIds, { fresh, nodes, signal }) {
      if (typeof this.provider.metrics !== 'function') {
        return { results: [] }
      }
      const resources = metricResources(nodes)
      if (!resources.length) {
        return { results: [] }
      }
      const items = resources.map((resource) => ({
        type: resource.type,
        id: resource.resourceId
      }))
      const resourceTypeById = new Map(
        resources.map((resource) => [String(resource.resourceId), resource.type])
      )
      const response = await this.provider.metrics({
        fresh,
        items,
        metric: this.effectiveMetricMode,
        mode: this.effectiveMetricMode,
        nodeIds,
        nodes: resources,
        signal
      })
      const results = responseResults(response).map((item) => {
        const amount = Number(item?.assets_amount ?? item?.count ?? item?.amount ?? item?.value)
        const id = item?.id ?? item?.resource_id
        const result = {
          ...item,
          id,
          type: item?.type || resourceTypeById.get(String(id))
        }
        if (Number.isFinite(amount)) {
          result.assets_amount = amount
        }
        return result
      })
      return responseWithResults(response, results)
    },
    handleSearchInput() {
      this.debouncedSearch()
    },
    handleSearchEnter() {
      this.debouncedSearch.cancel()
      return this.searchNow()
    },
    searchNow() {
      this.cancelLoadMoreRequests()
      return this.$refs.tree?.searchTree?.(this.searchKeyword.trim(), {
        limit: this.treeSetting.searchLimit
      })
    },
    toggleSearch() {
      this.searchVisible = !this.searchVisible
      if (this.searchVisible) {
        return
      }
      this.searchKeyword = ''
      this.debouncedSearch.cancel()
      this.searchNow()
    },
    focusSearchInput() {
      this.$nextTick(() => {
        window.cancelAnimationFrame(this.searchFocusFrame)
        this.searchFocusFrame = window.requestAnimationFrame(() => {
          this.searchFocusFrame = null
          this.$refs.searchInput?.focus?.()
        })
      })
    },
    handleSearchStateChange(state) {
      this.searchState = state.error ? { ...this.searchState, error: state.error } : state
      this.treeSetting.callback?.onSearchStateChange?.(state)
      this.$emit('search-state-change', state)
    },
    withLoadMoreNode(parent, resource, response, offset) {
      const normalized = normalizeUserTreeResponse(response)
      if (Array.isArray(response) || !response?.has_more) {
        return normalized
      }
      const currentOffset = Math.max(0, Number(response.offset ?? offset) || 0)
      const results = responseResults(normalized)
      const nextOffset = Number(
        response.next_offset ?? currentOffset + Number(response.returned_count ?? results.length)
      )
      if (!Number.isFinite(nextOffset) || nextOffset <= currentOffset) {
        return normalized
      }
      const parentTreeId = String(resource.treeId || parent?.id || '')
      if (!parentTreeId) {
        return normalized
      }
      const treeId = `${LOAD_MORE_RESOURCE_TYPE}:${parentTreeId}:${nextOffset}`
      const loadMoreNode = {
        id: treeId,
        pId: parentTreeId,
        parent_key: parentTreeId,
        name: '',
        hasChildren: false,
        isParent: false,
        _isLeaf: true,
        meta: {
          type: LOAD_MORE_RESOURCE_TYPE,
          data: {
            id: treeId,
            limit: Number(response.limit) || Number(this.treeSetting.childrenLimit) || 1000,
            next_offset: nextOffset,
            parent_resource_id: resource.resourceId,
            parent_tree_id: parentTreeId,
            parent_type: resource.type,
            resource_id: null,
            tree_id: treeId
          }
        }
      }
      return responseWithResults(normalized, [...results, loadMoreNode])
    },
    async loadMoreChildren(node) {
      const nodeId = String(node?.id || '')
      if (!nodeId || this.loadingMoreNodeIds.has(nodeId)) {
        return
      }
      const data = node?.meta?.data || {}
      const tree = this.$refs.tree
      const parent = tree?.findTreeNode?.(data.parent_tree_id)
      if (!parent || typeof this.provider.children !== 'function') {
        return
      }
      const parentResource = toUserTreeResource(parent)
      const offset = Math.max(0, Number(data.next_offset) || 0)
      const controller = new AbortController()
      this.loadMoreAbortControllers.set(nodeId, controller)
      this.loadingMoreNodeIds.add(nodeId)
      try {
        const response = await this.provider.children({
          limit: Number(data.limit) || Number(this.treeSetting.childrenLimit) || 1000,
          offset,
          order: this.userOrder,
          parent: parentResource,
          signal: controller.signal
        })
        this.updateChildTruncation(parent, parentResource, response)
        const normalized = this.withLoadMoreNode(parent, parentResource, response, offset)
        const additional = tree.normalizeTree(normalized)
        const merged = []
        const seen = new Set()
        for (const child of [...(parent.children || []), ...additional]) {
          if (this.getResourceType(child) === LOAD_MORE_RESOURCE_TYPE) {
            continue
          }
          const key = String(child.id)
          if (!seen.has(key)) {
            seen.add(key)
            merged.push(child)
          }
        }
        const nextLoadMore = additional.find(
          (child) => this.getResourceType(child) === LOAD_MORE_RESOURCE_TYPE
        )
        if (nextLoadMore) {
          merged.push(nextLoadMore)
        }
        tree.rememberNodeChildrenViewSource(parent, merged, { replace: true })
        await tree.setNodeChildrenView(parent)
      } catch (error) {
        if (error?.code !== 'ERR_CANCELED' && error?.name !== 'AbortError') {
          this.$log?.warn?.('Load more user-tree children failed', error)
        }
      } finally {
        if (this.loadMoreAbortControllers.get(nodeId) === controller) {
          this.loadMoreAbortControllers.delete(nodeId)
        }
        this.loadingMoreNodeIds.delete(nodeId)
      }
    },
    cancelLoadMoreRequests() {
      this.loadMoreAbortControllers?.forEach((controller) => controller.abort())
      this.loadMoreAbortControllers?.clear()
      this.loadingMoreNodeIds.clear()
    },
    updateChildTruncation(parent, resource, response) {
      if (Array.isArray(response)) {
        return
      }
      const identity = resource.treeId || resource.resourceId
      if (!identity) {
        return
      }
      this.childTruncations = this.childTruncations.filter((item) => item.identity !== identity)
      if (!response?.truncated && !response?.has_more) {
        return
      }
      const truncation = {
        identity,
        limit:
          Number(response.next_offset) ||
          Number(response.limit) ||
          Number(this.treeSetting.childrenLimit) ||
          1000,
        name: this.getResourceLabel(parent),
        resource,
        searchActive: Boolean(this.searchState.active)
      }
      this.childTruncations = [...this.childTruncations, truncation]
      this.treeSetting.callback?.onChildrenTruncated?.(truncation)
      this.$emit('children-truncated', truncation)
    },
    handleSelected(event, data) {
      const resource = toUserTreeResource(data)
      const context = {
        metricMode: this.effectiveMetricMode,
        permissionAll: this.permissionScope === 'direct' ? '0' : '1',
        permissionScope: this.permissionScope,
        search: this.searchState.active ? { ...this.searchState } : null,
        userOrder: this.userOrder
      }
      this.treeSetting.callback?.onSelected?.(event, data, context)
      this.$emit('select', resource, context)
      this.$emit('selected', resource, context)
    },
    beforeNodeSelect(event, data) {
      if (this.getResourceType(data) !== LOAD_MORE_RESOURCE_TYPE) {
        return true
      }
      this.loadMoreChildren(data)
      return false
    },
    handleToolCommand(command) {
      if (command === 'collapse') {
        this.collapseTreeStepwise()
      } else if (command === 'refresh') {
        this.refresh()
      }
    },
    handlePermissionScopeChange(value) {
      this.setPermissionScope(value)
      this.closeToolsDropdown()
    },
    setPermissionScope(value) {
      if (!PERMISSION_SCOPES.includes(value) || value === this.permissionScope) {
        return
      }
      this.permissionScope = value
      this.persistSettings()
      this.reloadVisibleMetrics({ fresh: false, resetNormal: true })
      const context = {
        permissionAll: value === 'direct' ? '0' : '1',
        permissionScope: value
      }
      this.treeSetting.callback?.onMetricModeChange?.(this.effectiveMetricMode, context)
      this.$emit('metric-change', this.effectiveMetricMode, context)
      const current = this.getSelectedNodes()[0] || null
      this.treeSetting.callback?.onPermissionScopeChange?.(value, current)
      this.$emit('permission-scope-change', value, current)
      if (current) {
        this.handleSelected(null, current)
      }
    },
    handleUserOrderChange(value) {
      this.setUserOrder(value)
      this.closeToolsDropdown()
    },
    async setUserOrder(value) {
      if (!isUserTreeOrder(value) || value === this.userOrder) {
        return
      }
      this.userOrder = value
      this.cancelLoadMoreRequests()
      this.clearSelection('sort')
      this.persistSettings()
      this.treeSetting.callback?.onUserOrderChange?.(value)
      this.$emit('sort-change', value)
      this.childTruncations = []
      const keyword = this.searchKeyword.trim()
      await this.$refs.tree?.refresh?.()
      if (keyword) {
        await this.searchNow()
      }
    },
    persistSettings() {
      writeCachedSettings(this.treeSetting, {
        permissionScope: this.permissionScope,
        userOrder: this.userOrder
      })
    },
    closeToolsDropdown() {
      this.$nextTick(() => this.$refs.toolsDropdown?.handleClose?.())
    },
    getResourceType(data) {
      return toUserTreeResource(data).type
    },
    getResourceLabel(data) {
      const type = this.getResourceType(data)
      if (type === LOAD_MORE_RESOURCE_TYPE) {
        return this.loadingMoreNodeIds.has(String(data?.id)) ? this.$t('Loading') : this.$t('More')
      }
      if (type !== 'user') {
        return data?.name || data?.meta?.data?.name || ''
      }
      const name = data?.name || data?.meta?.data?.name || ''
      const username = data?.username || data?.meta?.data?.username || ''
      return name && username && name !== username ? `${name}（${username}）` : name || username
    },
    shouldHandleAmount(data) {
      const resource = toUserTreeResource(data)
      return Boolean(resource.resourceId && METRIC_RESOURCE_TYPES.includes(resource.type))
    },
    getMetricAmountTitle(data) {
      const type = this.getResourceType(data)
      if (type === 'organization') {
        return this.$t('UserTreeAmountTipOrganization')
      }
      if (type === 'user_group') {
        return this.$t('UserTreeAmountTipDirect')
      }
      return this.$t(
        this.permissionScope === 'direct' ? 'UserTreeAmountTipDirect' : 'UserTreeAmountTipEffective'
      )
    },
    async refresh() {
      this.cancelLoadMoreRequests()
      this.clearSelection('refresh')
      this.childTruncations = []
      this.searchKeyword = ''
      this.searchState = { active: false, truncated: false }
      await this.$refs.tree?.refresh?.()
    },
    collapseTreeStepwise() {
      return this.$refs.tree?.collapseTreeStepwise?.()
    },
    reloadVisibleMetrics(options = { fresh: true, resetNormal: true }) {
      return this.$refs.tree?.reloadVisibleNodeAmounts?.(options)
    },
    invalidateNormalMetrics() {
      return this.$refs.tree?.invalidateNormalMetrics?.()
    },
    refreshRelationMetrics(resourceIds) {
      return this.$refs.tree?.refreshAssetRelationAmounts?.(resourceIds)
    },
    refreshAssetRelationAmounts(resourceIds) {
      return this.refreshRelationMetrics(resourceIds)
    },
    setNodeMetric(id, amount) {
      const tree = this.$refs.tree
      if (!tree?.setNodeMetric) {
        return false
      }
      const target = String(id)
      const visited = new Set()
      let matched = Boolean(tree.setNodeMetric(id, amount))
      const stack = [...this.getAllNodes(), ...this.getNodes()]
      while (stack.length) {
        const node = stack.pop()
        const resource = toUserTreeResource(node)
        if (
          resource.treeId &&
          !visited.has(String(resource.treeId)) &&
          ((resource.resourceId !== undefined &&
            resource.resourceId !== null &&
            String(resource.resourceId) === target) ||
            String(resource.treeId) === target)
        ) {
          visited.add(String(resource.treeId))
          matched = Boolean(tree.setNodeMetric(resource.treeId, amount)) || matched
        }
        if (node?.children?.length) {
          stack.push(...node.children)
        }
      }
      return matched
    },
    setMetricMode(mode) {
      if (mode === 'permission_direct') {
        this.setPermissionScope('direct')
      } else if (mode === 'permission_effective') {
        this.setPermissionScope('effective')
      }
    },
    getSelectedNodes() {
      return this.$refs.tree?.getSelectedNodes?.() || []
    },
    clearSelection(reason = 'manual') {
      const previous = this.$refs.tree?.clearSelection?.()
      if (!previous) {
        return null
      }
      const context = {
        permissionAll: this.permissionScope === 'direct' ? '0' : '1',
        permissionScope: this.permissionScope,
        reason,
        userOrder: this.userOrder
      }
      this.treeSetting.callback?.onSelectionClear?.(previous, context)
      this.$emit('selection-clear', previous, context)
      return previous
    },
    getNodes() {
      return this.$refs.tree?.getNodes?.() || []
    },
    getAllNodes() {
      return this.$refs.tree?.getAllNodes?.() || []
    },
    getTreeSnapshot() {
      return {
        ...this.$refs.tree?.getTreeSnapshot?.(),
        effectiveMetricMode: this.effectiveMetricMode,
        metricMode: this.effectiveMetricMode,
        permissionScope: this.permissionScope,
        search: { ...this.searchState },
        userOrder: this.userOrder
      }
    },
    selectNode(node) {
      return this.$refs.tree?.selectNode?.(node)
    },
    hideRMenu() {
      return this.$refs.tree?.hideRMenu?.()
    }
  }
}
</script>

<style lang="scss" scoped>
@use '../XTree/toolbar' as treeToolbar;

.user-tree {
  display: flex;
  flex-direction: column;
  height: var(--user-tree-height, 100%);
  min-height: var(--user-tree-min-height, 360px);
}

.user-tree__header-actions {
  @include treeToolbar.header-actions;
}

.user-tree__tool-button {
  @include treeToolbar.tool-button;
}

.user-tree__tool-icon {
  @include treeToolbar.tool-icon;
}

.user-tree__search-row {
  @include treeToolbar.search-row;

  display: block;
}

@include treeToolbar.search-transition('x-tree-search');

.user-tree__search-control {
  @include treeToolbar.search-control;

  width: 100%;
}

.user-tree__search-control :deep(.el-input__wrapper),
.user-tree__search-control :deep(.el-input__wrapper:hover),
.user-tree__search-control :deep(.el-input__wrapper.is-focus) {
  width: 100%;
  min-height: 28px;
  height: 28px;
  border: 0 !important;
  outline: none !important;
  background-color: transparent;
  box-shadow: none !important;
}

.user-tree__search-control :deep(.el-input__inner) {
  height: 28px;
  font-size: 13px;
}

.user-tree__resource-icon {
  flex: none;
  width: 14px;
  margin-right: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-align: center;
}

.user-tree :deep(.x-tree__header-actions) {
  display: none;
}

.user-tree :deep(.x-tree) {
  flex: 1 1 auto;
  height: auto;
  min-height: 0;
}

.user-tree.is-search-visible :deep(.x-tree__body) {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}
</style>
