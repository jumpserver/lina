<template>
  <div
    :style="treeStyle"
    :class="{
      'is-fill-height': treeSetting.fillHeight,
      'is-search-visible': treeSetting.showSearch && searchVisible
    }"
    class="node-asset-tree"
  >
    <div v-if="hasHeaderActions" class="node-asset-tree__header-actions">
      <el-button
        v-if="treeSetting.showSearch"
        :aria-label="$t('TreeActionSearch')"
        :class="{ 'is-active': searchVisible }"
        class="node-asset-tree__tool-button"
        @click="toggleSearch"
      >
        <el-icon class="node-asset-tree__tool-icon"><Search /></el-icon>
      </el-button>

      <el-dropdown
        v-if="hasToolsMenu"
        ref="toolsDropdown"
        :hide-timeout="280"
        placement="bottom-start"
        popper-class="x-tree-tools-popper node-asset-tree-tools-popper"
        :show-timeout="80"
        trigger="hover"
        @command="handleToolCommand"
      >
        <el-button :aria-label="$t('TreeActions')" class="node-asset-tree__tool-button">
          <el-icon class="node-asset-tree__tool-icon"><More /></el-icon>
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

            <template v-if="treeSetting.showMetrics">
              <li v-if="hasToolOperations" class="x-tree-tools__divider" />
              <li class="x-tree-settings__title">
                {{ $t('NodeAssetTreeMetric') }}
              </li>
              <li
                v-for="group in metricGroups"
                :key="group.value"
                :class="{
                  'is-open': activeMetricSubmenu === group.value,
                  'is-selected': group.options.some((option) => option.value === metricMode)
                }"
                class="x-tree-tools__submenu"
                @mouseenter="openMetricSubmenu(group.value)"
                @mouseleave="scheduleMetricSubmenuClose"
              >
                <button
                  :aria-label="group.label"
                  aria-haspopup="menu"
                  class="x-tree-tools__submenu-trigger"
                  type="button"
                  @click="openMetricSubmenu(group.value)"
                  @focus="openMetricSubmenu(group.value)"
                >
                  <span>{{ group.label }}</span>
                  <el-icon class="x-tree-tools__submenu-arrow"><ArrowRight /></el-icon>
                </button>
                <div
                  class="x-tree-tools__submenu-panel"
                  @mouseenter="openMetricSubmenu(group.value)"
                  @mouseleave="scheduleMetricSubmenuClose"
                >
                  <div class="x-tree-settings__radio-list" @click.capture="closeToolsDropdown">
                    <el-radio-group :model-value="metricMode" @change="handleMetricModeChange">
                      <el-radio
                        v-for="option in group.options"
                        :key="option.value"
                        :value="option.value"
                        class="x-tree-settings__radio"
                      >
                        {{ option.label }}
                      </el-radio>
                    </el-radio-group>
                  </div>
                </div>
              </li>
            </template>

            <template v-if="treeSetting.showPermissionScope">
              <li class="x-tree-tools__divider" />
              <li class="x-tree-settings__title">
                {{ $t('PermissionScope') }}
              </li>
              <li class="x-tree-settings__radio-list" @click.capture="closeToolsDropdown">
                <el-radio-group
                  :model-value="permissionScope"
                  @change="handlePermissionScopeChange"
                >
                  <el-radio
                    v-for="option in permissionOptions"
                    :key="option.scopeValue"
                    :value="option.scopeValue"
                    class="x-tree-settings__radio"
                  >
                    {{ option.label }}
                  </el-radio>
                </el-radio-group>
              </li>
            </template>

            <template v-if="treeSetting.showAssetOrder">
              <li class="x-tree-tools__divider" />
              <li class="x-tree-settings__title">
                {{ $t('NodeAssetTreeAssetOrder') }}
              </li>
              <li class="x-tree-settings__radio-list" @click.capture="closeToolsDropdown">
                <el-radio-group :model-value="assetOrder" @change="handleAssetOrderChange">
                  <el-radio
                    v-for="option in assetOrderOptions"
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
      <div v-if="treeSetting.showSearch && searchVisible" class="node-asset-tree__search-row">
        <el-tooltip
          :content="searchPlaceholder"
          :disabled="!showSearchPlaceholderTooltip"
          :show-after="400"
          placement="top"
        >
          <el-input
            ref="searchInput"
            v-model="searchKeyword"
            :placeholder="searchPlaceholder"
            class="node-asset-tree__search-control node-asset-tree__search-input"
            clearable
            @input="handleSearchInput"
            @keydown.enter.prevent="handleSearchEnter"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #suffix>
              <el-popover
                ref="searchSettingsPopover"
                :width="268"
                placement="bottom-start"
                popper-class="node-asset-tree-search-settings-popper"
                trigger="click"
              >
                <template #reference>
                  <button
                    :aria-label="$t('NodeAssetTreeSearchAdvanced')"
                    :class="{ 'is-filtered': hasCustomSearchSettings }"
                    class="node-asset-tree__search-settings-trigger"
                    type="button"
                    @click.stop
                    @pointerdown.stop
                  >
                    <el-icon><Operation /></el-icon>
                  </button>
                </template>

                <div class="node-asset-tree-search-settings">
                  <section class="node-asset-tree-search-settings__section">
                    <div class="node-asset-tree-search-settings__title">
                      {{ $t('NodeAssetTreeSearchTarget') }}
                    </div>
                    <el-radio-group
                      :model-value="searchTarget"
                      class="node-asset-tree-search-settings__radios"
                      @change="handleSearchTargetChange"
                    >
                      <div
                        v-for="option in searchTargetOptions"
                        :key="option.value"
                        class="node-asset-tree-search-settings__target-option"
                      >
                        <el-radio :value="option.value">
                          {{ option.label }}
                        </el-radio>
                        <el-icon
                          v-if="option.value === 'asset'"
                          class="node-asset-tree-search-settings__submenu-arrow"
                        >
                          <ArrowRight />
                        </el-icon>

                        <div
                          v-if="option.value === 'asset' && searchTarget === 'asset'"
                          class="node-asset-tree-search-settings__asset-submenu"
                          @click.stop
                        >
                          <el-checkbox
                            :model-value="searchIncludeParents"
                            class="node-asset-tree-search-settings__asset-option"
                            @change="handleSearchIncludeParentsChange"
                          >
                            {{ $t('NodeAssetTreeSearchIncludeParents') }}
                          </el-checkbox>
                        </div>
                      </div>
                    </el-radio-group>
                  </section>
                </div>
              </el-popover>
            </template>
          </el-input>
        </el-tooltip>
      </div>
    </transition>

    <XTree
      ref="tree"
      :setting="xTreeSetting"
      @tree-init-finish="handleTreeInitFinish"
      @url-change="$emit('url-change', $event)"
    >
      <template #node-icon="{ data, expanded, leaf }">
        <img
          v-if="isAsset(data) && usesPlatformAssetIcons"
          :src="getAssetPlatformIcon(data)"
          alt=""
          class="node-asset-tree__asset-icon node-asset-tree__platform-icon"
        />
        <Icon
          v-else-if="isAsset(data)"
          :icon="getAssetIcon(data)"
          class="node-asset-tree__asset-icon"
        />
        <TreeFolderIcon
          v-else
          :leaf="leaf"
          :expanded="expanded"
          class="node-asset-tree__node-icon"
        />
      </template>
      <template #node-actions="{ data, expanded }">
        <span
          v-if="expanded && !isAsset(data) && !searchState.active"
          class="node-asset-tree__node-tools"
          @click.stop
          @pointerdown.stop
        >
          <el-dropdown
            :hide-on-click="true"
            :hide-timeout="180"
            placement="bottom-start"
            popper-class="x-tree-tools-popper node-asset-tree-node-tools-popper"
            :show-timeout="80"
            trigger="hover"
            @command="handleNodeToolCommand($event, data)"
          >
            <button
              :aria-label="$t('NodeAssetTreeNodeSettings')"
              class="node-asset-tree__node-tools-trigger"
              type="button"
            >
              <el-icon><More /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu class="node-asset-tree-node-tools__menu">
                <li class="x-tree-settings__title">
                  {{ $t('NodeAssetTreeDisplayContent') }}
                </li>
                <el-dropdown-item
                  v-for="option in nodeDisplayOptions"
                  :key="option.value"
                  :class="{
                    'is-selected': getNodeSetting(data, 'display', 'both') === option.value
                  }"
                  :command="{ field: 'display', value: option.value }"
                >
                  <span class="node-asset-tree-node-tools__radio" />
                  <span>{{ option.label }}</span>
                </el-dropdown-item>
                <li class="x-tree-tools__divider" />
                <li class="x-tree-settings__title">
                  {{ $t('NodeAssetTreeAssetOrder') }}
                </li>
                <el-dropdown-item
                  v-for="option in assetOrderOptions"
                  :key="option.value"
                  :class="{
                    'is-selected': getNodeSetting(data, 'assetOrder', assetOrder) === option.value
                  }"
                  :command="{ field: 'assetOrder', value: option.value }"
                >
                  <span class="node-asset-tree-node-tools__radio" />
                  <span>{{ option.label }}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </span>
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
import { loadPlatformIcon } from '@/utils/jms/index'
import {
  isNodeAssetMetricMode,
  NODE_ASSET_METRIC_MODES,
  NODE_ASSET_SEARCH_TARGETS,
  normalizeNodeAssetResponse,
  toNodeAssetResource
} from './provider'

const SETTINGS_CACHE_PREFIX = 'jms.node-asset-tree.settings.'
const MAX_SEARCH_RESULTS = 100
const ASSET_ORDER_VALUES = Object.freeze(['name', 'address'])
const NODE_DISPLAY_VALUES = Object.freeze(['both', 'nodes', 'assets'])
const ASSET_ICON_MAP = Object.freeze({
  database: 'fa-database',
  device: 'fa-network-wired',
  file: 'fa-server',
  linux: 'fa-brands fa-linux',
  macos: 'fa-brands fa-apple',
  mysql: 'fa-database',
  network: 'fa-network-wired',
  oracle: 'fa-database',
  postgresql: 'fa-database',
  switch: 'fa-network-wired',
  unix: 'fa-terminal',
  windows: 'fa-brands fa-windows'
})

function getAllowedMetricModes(setting = {}) {
  const configured = Array.isArray(setting.metricModes)
    ? setting.metricModes
    : NODE_ASSET_METRIC_MODES
  const allowed = configured.filter((value) => isNodeAssetMetricMode(value))
  return allowed.length ? allowed : [...NODE_ASSET_METRIC_MODES]
}

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
    // Storage may be disabled by the browser. The in-memory settings still work.
  }
}

function responseResults(response) {
  return Array.isArray(response) ? response : response?.results || response?.tree || []
}

function responseWithResults(response, results) {
  return Array.isArray(response) ? results : { ...response, results }
}

/**
 * A reusable node-and-asset tree for permission-oriented pages.
 *
 * Data is supplied exclusively through `dataSource`; this component does not
 * know permission endpoint URLs. A source may implement:
 *
 * - root({ refresh, assetsLimit, signal })
 * - children({ parent, level, includeAssets, assetsLimit, signal }) -> Array or
 *   { results, assets_truncated, assets_limit }
 * - search({ keyword, target, limit, signal })
 * - metrics({ nodes, nodeIds, mode, search, fresh, signal })
 *
 * Every visual asset occurrence gets a composite tree ID. Selection events
 * expose `resourceId` separately so callers never send that composite ID to an
 * API. `selected(resource, context)` and `select(resource, context)` include
 * the active metric, permission scope and search context. Public ref methods
 * include `refresh()`, `collapseTreeStepwise()`,
 * `reloadVisibleMetrics({ fresh, resetNormal })`, `setMetricMode(mode)`,
 * `invalidateNormalMetrics()`, `setPermissionScope(scope)`, `selectNode(node)`
 * and the tree/snapshot getters.
 * See `provider.js` for the normalized resource contract.
 */
export default {
  name: 'NodeAssetTree',
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
    'metric-change',
    'children-truncated',
    'permission-scope-change',
    'search-state-change',
    'select',
    'selected',
    'tree-init-finish',
    'url-change'
  ],
  data() {
    const cachedSettings = readCachedSettings(this.setting)
    const allowedMetricModes = getAllowedMetricModes(this.setting)
    const configuredDefaultTarget = NODE_ASSET_SEARCH_TARGETS.includes(
      this.setting.defaultSearchTarget
    )
      ? this.setting.defaultSearchTarget
      : 'all'
    const defaultTarget = NODE_ASSET_SEARCH_TARGETS.includes(cachedSettings.searchTarget)
      ? cachedSettings.searchTarget
      : configuredDefaultTarget
    const defaultSearchIncludeParents =
      typeof cachedSettings.searchIncludeParents === 'boolean'
        ? cachedSettings.searchIncludeParents
        : this.setting.defaultSearchIncludeParents !== false
    let defaultPermissionScope =
      cachedSettings.permissionScope === 'direct' || cachedSettings.permissionScope === 'effective'
        ? cachedSettings.permissionScope
        : this.setting.defaultPermissionScope === 'direct'
          ? 'direct'
          : 'effective'
    const permissionScopeMode =
      defaultPermissionScope === 'direct' ? 'permission_direct' : 'permission_effective'
    const configuredDefaultMode = allowedMetricModes.includes(this.setting.defaultMetricMode)
      ? this.setting.defaultMetricMode
      : allowedMetricModes.includes(permissionScopeMode)
        ? permissionScopeMode
        : allowedMetricModes[0]
    const defaultMode = allowedMetricModes.includes(cachedSettings.metricMode)
      ? cachedSettings.metricMode
      : configuredDefaultMode
    const defaultAssetOrder = ASSET_ORDER_VALUES.includes(cachedSettings.assetOrder)
      ? cachedSettings.assetOrder
      : ASSET_ORDER_VALUES.includes(this.setting.defaultAssetOrder)
        ? this.setting.defaultAssetOrder
        : 'name'
    if (defaultMode === 'permission_direct') {
      defaultPermissionScope = 'direct'
    } else if (defaultMode === 'permission_effective') {
      defaultPermissionScope = 'effective'
    }
    return {
      activeMetricSubmenu: null,
      assetOrder: defaultAssetOrder,
      childTruncations: [],
      metricSubmenuCloseTimer: null,
      metricMode: defaultMode,
      nodeSettings: new Map(),
      permissionScope: defaultPermissionScope,
      searchFocusFrame: null,
      searchIncludeParents: defaultSearchIncludeParents,
      searchKeyword: '',
      searchPlaceholderOverflow: false,
      searchPlaceholderResizeObserver: null,
      searchState: { active: false, truncated: false },
      searchTarget: defaultTarget,
      searchVisible: false
    }
  },
  computed: {
    treeSetting() {
      return createXTreeSetting({
        showCollapse: true,
        showMetrics: true,
        showPermissionScope: true,
        showAssetOrder: true,
        showRefresh: true,
        showSearch: true,
        fillHeight: true,
        height: '100%',
        minHeight: '360px',
        childrenAssetLimit: 1000,
        searchLimit: MAX_SEARCH_RESULTS,
        ...this.setting,
        loadMode: this.setting.loadMode || X_TREE_LOAD_MODES.LAZY
      })
    },
    provider() {
      return this.dataSource || this.treeSetting.dataSource || {}
    },
    usesPlatformAssetIcons() {
      return this.treeSetting.assetIconMode === 'platform'
    },
    effectiveMetricMode() {
      return this.metricMode
    },
    activeAmountTypes() {
      return this.effectiveMetricMode.startsWith('permission_') ? ['node', 'asset'] : ['node']
    },
    assetLoadLimit() {
      return Math.min(Math.max(1, Number(this.treeSetting.childrenAssetLimit) || 1000), 1000)
    },
    treeStyle() {
      const toCssSize = (value, fallback) => {
        if (typeof value === 'number') {
          return `${value}px`
        }
        return value || fallback
      }
      return {
        '--node-asset-tree-height': toCssSize(this.treeSetting.height, '100%'),
        '--node-asset-tree-min-height': toCssSize(this.treeSetting.minHeight, '360px')
      }
    },
    permissionOptions() {
      return [
        {
          label: this.$t('PermissionScopeEffective'),
          metricValue: 'permission_effective',
          scopeValue: 'effective'
        },
        {
          label: this.$t('PermissionScopeDirect'),
          metricValue: 'permission_direct',
          scopeValue: 'direct'
        }
      ]
    },
    assetOrderOptions() {
      return [
        {
          label: this.$t('NodeAssetTreeAssetOrderName'),
          value: 'name'
        },
        {
          label: this.$t('NodeAssetTreeAssetOrderAddress'),
          value: 'address'
        }
      ]
    },
    nodeDisplayOptions() {
      return [
        {
          label: this.$t('NodeAssetTreeDisplayBoth'),
          value: 'both'
        },
        {
          label: this.$t('NodeAssetTreeDisplayNodes'),
          value: 'nodes'
        },
        {
          label: this.$t('NodeAssetTreeDisplayAssets'),
          value: 'assets'
        }
      ]
    },
    metricGroups() {
      const available = new Set(getAllowedMetricModes(this.treeSetting))
      return [
        {
          label: this.$t('NodeAssetTreeMetricAsset'),
          options: [
            {
              label: this.$t('NodeAssetTreeMetricAssetAll'),
              value: 'asset_all'
            },
            {
              label: this.$t('NodeAssetTreeMetricAssetDirect'),
              value: 'asset_direct'
            }
          ],
          value: 'asset'
        },
        {
          label: this.$t('NodeAssetTreeMetricPermission'),
          options: this.permissionOptions.map((option) => ({
            label: option.label,
            value: option.metricValue
          })),
          value: 'permission'
        }
      ]
        .map((group) => ({
          ...group,
          options: group.options.filter((option) => available.has(option.value))
        }))
        .filter((group) => group.options.length)
    },
    hasToolOperations() {
      return this.treeSetting.showCollapse || this.treeSetting.showRefresh
    },
    hasToolsMenu() {
      return (
        this.hasToolOperations ||
        this.treeSetting.showMetrics ||
        this.treeSetting.showPermissionScope ||
        this.treeSetting.showAssetOrder
      )
    },
    hasHeaderActions() {
      return this.treeSetting.showSearch || this.hasToolsMenu
    },
    searchPlaceholder() {
      const keyMap = {
        all: 'NodeAssetTreeSearchAllPlaceholder',
        asset: 'NodeAssetTreeSearchAssetPlaceholder',
        node: 'NodeAssetTreeSearchNodePlaceholder'
      }
      return this.$t(keyMap[this.searchTarget] || keyMap.all)
    },
    searchTargetOptions() {
      return [
        { label: this.$t('NodeAssetTreeSearchAll'), value: 'all' },
        { label: this.$t('NodeAssetTreeSearchNodes'), value: 'node' },
        { label: this.$t('NodeAssetTreeSearchAssets'), value: 'asset' }
      ]
    },
    hasCustomSearchSettings() {
      return (
        this.searchTarget !== 'all' || (this.searchTarget === 'asset' && !this.searchIncludeParents)
      )
    },
    showSearchPlaceholderTooltip() {
      return !this.searchKeyword && this.searchPlaceholderOverflow
    },
    currentSearchContext() {
      const configuredLimit = Math.max(
        1,
        Number(this.treeSetting.searchLimit) || MAX_SEARCH_RESULTS
      )
      return {
        includeParents: this.searchTarget === 'asset' ? this.searchIncludeParents : true,
        limit: Math.min(configuredLimit, MAX_SEARCH_RESULTS),
        target: this.searchTarget
      }
    },
    xTreeSetting() {
      const initialData = Array.isArray(this.treeSetting.initialData)
        ? responseResults(normalizeNodeAssetResponse(this.treeSetting.initialData))
        : null
      return {
        ...this.treeSetting,
        amountPredicate: this.shouldHandleAmount,
        amountTypes: this.activeAmountTypes,
        callback: {
          ...this.treeSetting.callback,
          onSearchStateChange: this.handleSearchStateChange,
          onSelected: this.handleSelected
        },
        dataSource: undefined,
        getAmountKey: (node) => {
          const resource = toNodeAssetResource(node)
          return `${resource.type}:${resource.resourceId}`
        },
        getAmountResultKey: (item) => {
          const id = item?.id ?? item?.node_id ?? item?.resource_id
          return `${item?.type || 'node'}:${id}`
        },
        getNodeLabel: this.treeSetting.getNodeLabel || this.getResourceLabel,
        getNodeKey: (node) => node?.meta?.data?.tree_id ?? node?.id,
        getNodeAmountTitle: this.getMetricAmountTitle,
        initialData,
        lazyLoad: true,
        loadChildren: this.loadChildren,
        loadNodeAmounts: this.loadMetrics,
        loadRoot: this.loadRoot,
        readOnly: this.treeSetting.readOnly !== false,
        search: this.search,
        showAssetScope: false,
        showAssets: true,
        showCollapse: false,
        showRefresh: false,
        showSearch: false,
        virtualThreshold: this.treeSetting.virtualThreshold || 800,
        // Element Plus' virtual tree has no lazy-load hook. Search results can
        // contain a real branch whose children were intentionally omitted, so
        // keep the regular lazy tree here and let its arrow fetch those direct
        // children on demand. Search results are capped by the provider.
        virtualizeSearch: false
      }
    }
  },
  created() {
    this.debouncedSearch = _.debounce(this.searchNow, 250)
  },
  watch: {
    searchPlaceholder() {
      this.$nextTick(this.updateSearchPlaceholderOverflow)
    }
  },
  beforeUnmount() {
    this.debouncedSearch?.cancel()
    this.searchPlaceholderResizeObserver?.disconnect()
    clearTimeout(this.metricSubmenuCloseTimer)
    window.cancelAnimationFrame(this.searchFocusFrame)
  },
  methods: {
    withMetricValues(response, mode) {
      const addMetric = (raw) => {
        const value =
          raw?.metrics?.[mode] ??
          raw?.[mode] ??
          raw?.amount ??
          raw?.meta?.data?.metrics?.[mode] ??
          (mode === 'asset_all' ? raw?.assets_amount : null)
        const amount = value === null || value === undefined ? null : Number(value)
        return {
          ...raw,
          assets_amount: Number.isFinite(amount) ? amount : null,
          children: (raw.children || []).map(addMetric)
        }
      }
      return responseWithResults(response, responseResults(response).map(addMetric))
    },
    async loadRoot(payload) {
      if (typeof this.provider.root !== 'function') {
        return []
      }
      this.childTruncations = []
      const response = await this.provider.root({
        ...payload,
        assetOrder: this.assetOrder,
        assetsLimit: this.assetLoadLimit
      })
      const normalized = normalizeNodeAssetResponse(
        this.withMetricValues(response, this.metricMode)
      )
      this.updateChildTruncation(this.findResponseRootNode(normalized), normalized, {
        identity: '__root__',
        name: this.treeSetting.rootName || this.$t('NodeTree'),
        scope: 'root'
      })
      return normalized
    },
    async loadChildren({ level, parent, signal }) {
      if (typeof this.provider.children !== 'function') {
        return []
      }
      const response = await this.provider.children({
        assetOrder: this.getNodeSetting(parent, 'assetOrder', this.assetOrder),
        assetsLimit: this.assetLoadLimit,
        includeAssets: !(this.searchState.active && this.searchState.target === 'node'),
        level,
        parent: toNodeAssetResource(parent),
        signal
      })
      this.updateChildTruncation(parent, response)
      return normalizeNodeAssetResponse(this.withMetricValues(response, this.effectiveMetricMode))
    },
    async search(payload) {
      if (typeof this.provider.search !== 'function') {
        return []
      }
      const response = await this.provider.search({
        ...payload,
        limit: Math.min(Number(payload.limit) || 1000, 1000)
      })
      return normalizeNodeAssetResponse(this.withMetricValues(response, this.metricMode))
    },
    async loadMetrics(nodeIds, { fresh, nodes, signal }) {
      if (typeof this.provider.metrics !== 'function') {
        return { results: [] }
      }
      const response = await this.provider.metrics({
        fresh,
        mode: this.effectiveMetricMode,
        nodeIds,
        nodes: nodes.map(toNodeAssetResource),
        search: this.searchState.active
          ? {
              keyword: this.searchState.keyword,
              target: this.searchState.target
            }
          : null,
        signal
      })
      const results = responseResults(response).map((item) => ({
        ...item,
        assets_amount: Number(
          item.assets_amount ??
            item.amount ??
            item.count ??
            item.value ??
            item.metrics?.[this.effectiveMetricMode] ??
            item[this.effectiveMetricMode]
        ),
        id: item.id ?? item.node_id ?? item.resource_id
      }))
      return responseWithResults(response, results)
    },
    findResponseRootNode(response) {
      return responseResults(response).find((item) => {
        const parentKey = item?.pId ?? item?.parent_key ?? item?.meta?.data?.parent_key
        return item?.meta?.type === 'node' && !parentKey
      })
    },
    updateChildTruncation(parent, response, options = {}) {
      if (Array.isArray(response)) {
        return
      }
      const resource = parent ? toNodeAssetResource(parent) : null
      const identity = resource?.treeId || resource?.resourceId || options.identity
      if (!identity) {
        return
      }
      this.childTruncations = this.childTruncations.filter((item) => item.identity !== identity)
      if (!response?.assets_truncated) {
        return
      }
      const truncation = {
        identity,
        limit: Number(response.assets_limit) || Number(this.treeSetting.childrenAssetLimit) || 1000,
        name: parent?.name || resource?.treeKey || options.name || '',
        resource,
        scope: options.scope || 'children'
      }
      this.childTruncations = [...this.childTruncations, truncation]
      this.$emit('children-truncated', truncation)
      this.treeSetting.callback?.onChildrenTruncated?.(truncation)
    },
    handleSearchInput() {
      this.debouncedSearch()
    },
    handleSearchEnter() {
      this.debouncedSearch.cancel()
      return this.searchNow()
    },
    handleSearchTargetChange(value) {
      if (!NODE_ASSET_SEARCH_TARGETS.includes(value) || value === this.searchTarget) {
        return
      }
      this.searchTarget = value
      this.handleSearchOptionChange()
    },
    handleSearchIncludeParentsChange(value) {
      const includeParents = Boolean(value)
      if (includeParents === this.searchIncludeParents) {
        return
      }
      this.searchIncludeParents = includeParents
      this.handleSearchOptionChange()
    },
    handleSearchOptionChange() {
      this.persistSettings()
      if (this.searchKeyword.trim()) {
        this.debouncedSearch.cancel()
        this.searchNow()
      }
    },
    async searchNow() {
      const keyword = this.searchKeyword.trim()
      await this.$refs.tree?.searchTree(keyword, this.currentSearchContext)
    },
    toggleSearch() {
      this.searchVisible = !this.searchVisible
      if (!this.searchVisible) {
        this.searchPlaceholderResizeObserver?.disconnect()
        this.searchPlaceholderResizeObserver = null
        this.searchPlaceholderOverflow = false
        this.$refs.searchSettingsPopover?.hide?.()
        this.searchKeyword = ''
        this.debouncedSearch.cancel()
        this.searchNow()
      }
    },
    focusSearchInput() {
      this.$nextTick(() => {
        window.cancelAnimationFrame(this.searchFocusFrame)
        this.searchFocusFrame = window.requestAnimationFrame(() => {
          this.searchFocusFrame = null
          this.$refs.searchInput?.focus?.()
          this.observeSearchPlaceholder()
        })
      })
    },
    observeSearchPlaceholder() {
      this.searchPlaceholderResizeObserver?.disconnect()
      const input = this.$refs.searchInput?.input
      if (!input) {
        return
      }
      if (typeof ResizeObserver !== 'undefined') {
        this.searchPlaceholderResizeObserver = new ResizeObserver(
          this.updateSearchPlaceholderOverflow
        )
        this.searchPlaceholderResizeObserver.observe(input)
      }
      this.updateSearchPlaceholderOverflow()
    },
    updateSearchPlaceholderOverflow() {
      const input = this.$refs.searchInput?.input
      if (!input || typeof window === 'undefined') {
        this.searchPlaceholderOverflow = false
        return
      }
      const style = window.getComputedStyle(input)
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) {
        this.searchPlaceholderOverflow = false
        return
      }
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      const horizontalPadding =
        (Number.parseFloat(style.paddingLeft) || 0) + (Number.parseFloat(style.paddingRight) || 0)
      const availableWidth = Math.max(0, input.clientWidth - horizontalPadding)
      this.searchPlaceholderOverflow =
        context.measureText(this.searchPlaceholder).width > availableWidth + 1
    },
    handleSearchStateChange(state) {
      if (state.error) {
        this.searchState = { ...this.searchState, error: state.error }
        this.$emit('search-state-change', state)
        this.treeSetting.callback?.onSearchStateChange?.(state)
        return
      }
      this.searchState = state
      this.$emit('search-state-change', state)
      this.treeSetting.callback?.onSearchStateChange?.(state)
    },
    handleTreeInitFinish(tree) {
      this.$emit('tree-init-finish', tree)
    },
    handleSelected(event, data) {
      const resource = toNodeAssetResource(data)
      const context = {
        metricMode: this.effectiveMetricMode,
        permissionAll: this.permissionScope === 'direct' ? '0' : '1',
        permissionScope: this.permissionScope,
        search: this.searchState.active ? { ...this.searchState } : null
      }
      this.treeSetting.callback?.onSelected?.(event, data, context)
      this.$emit('select', resource, context)
      this.$emit('selected', resource, context)
    },
    handleMetricModeChange(value) {
      this.setMetricMode(value)
      this.closeToolsDropdown()
    },
    setMetricMode(value) {
      if (!getAllowedMetricModes(this.treeSetting).includes(value)) {
        return
      }
      const previousMode = this.metricMode
      const previousScope = this.permissionScope
      this.metricMode = value
      if (value === 'permission_direct') {
        this.permissionScope = 'direct'
      } else if (value === 'permission_effective') {
        this.permissionScope = 'effective'
      }
      this.persistSettings()
      if (previousMode !== value) {
        this.reloadVisibleMetrics({ fresh: false, resetNormal: true })
        this.notifyMetricModeChange(value)
      }
      if (previousScope !== this.permissionScope) {
        this.notifyPermissionScopeChange(this.permissionScope)
      }
    },
    notifyMetricModeChange(value) {
      const context = {
        permissionAll: this.permissionScope === 'direct' ? '0' : '1',
        permissionScope: this.permissionScope
      }
      this.treeSetting.callback?.onMetricModeChange?.(value, context)
      this.$emit('metric-change', value, context)
    },
    handlePermissionScopeChange(value) {
      this.setPermissionScope(value)
      this.closeToolsDropdown()
    },
    setPermissionScope(value) {
      if (value !== 'direct' && value !== 'effective') {
        return
      }
      if (value === this.permissionScope) {
        return
      }
      this.permissionScope = value
      const previousMode = this.metricMode
      if (this.metricMode.startsWith('permission_')) {
        this.metricMode = value === 'direct' ? 'permission_direct' : 'permission_effective'
      }
      this.persistSettings()
      if (previousMode !== this.metricMode) {
        this.reloadVisibleMetrics({ fresh: false, resetNormal: true })
        this.notifyMetricModeChange(this.metricMode)
      }
      this.notifyPermissionScopeChange(value)
    },
    notifyPermissionScopeChange(value) {
      const current = this.getSelectedNodes()[0] || null
      this.treeSetting.callback?.onPermissionScopeChange?.(value, current)
      this.$emit('permission-scope-change', value, current)
      if (current) {
        this.handleSelected(null, current)
      }
    },
    handleToolCommand(command) {
      if (command === 'collapse') {
        this.collapseTreeStepwise()
      } else if (command === 'refresh') {
        this.refresh()
      }
    },
    openMetricSubmenu(value) {
      clearTimeout(this.metricSubmenuCloseTimer)
      this.metricSubmenuCloseTimer = null
      this.activeMetricSubmenu = value
    },
    scheduleMetricSubmenuClose() {
      clearTimeout(this.metricSubmenuCloseTimer)
      this.metricSubmenuCloseTimer = setTimeout(() => {
        this.metricSubmenuCloseTimer = null
        this.activeMetricSubmenu = null
      }, 260)
    },
    persistSettings() {
      writeCachedSettings(this.treeSetting, {
        assetOrder: this.assetOrder,
        metricMode: this.metricMode,
        permissionScope: this.permissionScope,
        searchIncludeParents: this.searchIncludeParents,
        searchTarget: this.searchTarget
      })
    },
    async handleAssetOrderChange(value) {
      if (!ASSET_ORDER_VALUES.includes(value) || value === this.assetOrder) {
        this.closeToolsDropdown()
        return
      }
      this.assetOrder = value
      this.persistSettings()
      await this.applyLoadedNodeSettings()
      this.closeToolsDropdown()
    },
    getNodeSetting(node, field, fallback) {
      const value = this.nodeSettings.get(String(node?.id ?? ''))?.[field]
      return value === undefined ? fallback : value
    },
    setNodeSetting(node, field, value) {
      const key = String(node?.id ?? '')
      if (!key) {
        return
      }
      const settings = {
        ...(this.nodeSettings.get(key) || {}),
        [field]: value
      }
      const next = new Map(this.nodeSettings)
      next.set(key, settings)
      this.nodeSettings = next
    },
    async handleNodeToolCommand(command, node) {
      const { field, value } = command || {}
      if (
        !['display', 'assetOrder'].includes(field) ||
        (field === 'display' && !NODE_DISPLAY_VALUES.includes(value)) ||
        (field === 'assetOrder' && !ASSET_ORDER_VALUES.includes(value))
      ) {
        return
      }
      this.setNodeSetting(node, field, value)
      await this.applyNodeSettings(node)
    },
    sortNodeChildren(children, order) {
      const nodes = []
      const assets = []
      children.forEach((child) => {
        if (this.isAsset(child)) {
          assets.push(child)
        } else {
          nodes.push(child)
        }
      })
      const secondary = order === 'address' ? 'name' : 'address'
      const valueOf = (item, field) => String(item?.[field] ?? item?.meta?.data?.[field] ?? '')
      assets.sort((left, right) => {
        const primaryResult = valueOf(left, order).localeCompare(valueOf(right, order), undefined, {
          numeric: true,
          sensitivity: 'base'
        })
        if (primaryResult) {
          return primaryResult
        }
        return valueOf(left, secondary).localeCompare(valueOf(right, secondary), undefined, {
          numeric: true,
          sensitivity: 'base'
        })
      })
      return [...nodes, ...assets]
    },
    getNodeViewOptions(node) {
      const display = this.getNodeSetting(node, 'display', 'both')
      const assetOrder = this.getNodeSetting(node, 'assetOrder', this.assetOrder)
      return {
        filter: (child) => {
          if (display === 'nodes') {
            return !this.isAsset(child)
          }
          if (display === 'assets') {
            return this.isAsset(child)
          }
          return true
        },
        sort: (children) => this.sortNodeChildren(children, assetOrder)
      }
    },
    applyNodeSettings(node, options = {}) {
      return this.$refs.tree?.setNodeChildrenView?.(node, {
        ...this.getNodeViewOptions(node),
        ...options
      })
    },
    async applyLoadedNodeSettings() {
      const parents = this.$refs.tree?.getNodeChildrenViewParents?.() || []
      for (const parent of parents) {
        await this.applyNodeSettings(parent, { defer: true })
      }
      await this.$refs.tree?.finalizeNodeChildrenViews?.()
    },
    closeToolsDropdown() {
      clearTimeout(this.metricSubmenuCloseTimer)
      this.metricSubmenuCloseTimer = null
      this.activeMetricSubmenu = null
      this.$nextTick(() => this.$refs.toolsDropdown?.handleClose?.())
    },
    isAsset(data) {
      return data?.meta?.type === 'asset'
    },
    getResourceLabel(data) {
      if (!this.isAsset(data)) {
        return data?.name || data?.meta?.data?.value || ''
      }
      const name = data?.meta?.data?.name || data?.name || ''
      const address = data?.address || data?.meta?.data?.address || ''
      return name && address ? `${name} (${address})` : name || address
    },
    shouldHandleAmount(data) {
      return this.activeAmountTypes.includes(data?.meta?.type)
    },
    getAssetIcon(data) {
      if (typeof this.treeSetting.getAssetIcon === 'function') {
        return this.treeSetting.getAssetIcon(data)
      }
      const skin = String(
        data?.iconSkin || data?.meta?.data?.icon_skin || data?.meta?.data?.platform_type || 'file'
      ).toLowerCase()
      return ASSET_ICON_MAP[skin] || 'fa-server'
    },
    getAssetPlatformIcon(data) {
      const asset = data?.meta?.data || {}
      const platform = asset.platform || data?.platform || {}
      const platformName = asset.platform_name || platform.name || data?.platform_name || ''
      const platformType =
        asset.platform_type ||
        platform.type?.value ||
        platform.type ||
        data?.platform_type ||
        data?.iconSkin ||
        'other'
      return loadPlatformIcon(platformName, String(platformType).toLowerCase())
    },
    getMetricAmountTitle(node) {
      const keyMap = {
        asset_all: 'NodeAssetTreeAmountTipAssetAll',
        asset_direct: 'NodeAssetTreeAmountTipAssetDirect',
        permission_effective: 'NodeAssetTreeAmountTipPermissionEffective',
        search_assets: 'NodeAssetTreeAmountTipSearchAssets'
      }
      if (this.effectiveMetricMode === 'permission_direct') {
        return this.$t(
          this.isAsset(node)
            ? 'NodeAssetTreeAmountTipPermissionAssetDirect'
            : 'NodeAssetTreeAmountTipPermissionNodeDirect'
        )
      }
      const key = keyMap[this.effectiveMetricMode]
      return key ? this.$t(key) : ''
    },
    async refresh() {
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
    refreshAssetRelationAmounts(nodeIds) {
      return this.$refs.tree?.refreshAssetRelationAmounts?.(nodeIds)
    },
    getSelectedNodes() {
      return this.$refs.tree?.getSelectedNodes?.() || []
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
        metricMode: this.metricMode,
        permissionScope: this.permissionScope,
        search: { ...this.searchState }
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

.node-asset-tree {
  display: flex;
  flex-direction: column;
  height: var(--node-asset-tree-height, 100%);
  min-height: var(--node-asset-tree-min-height, 360px);
}

.node-asset-tree__header-actions {
  @include treeToolbar.header-actions;
}

.node-asset-tree__tool-button {
  @include treeToolbar.tool-button;
}

.node-asset-tree__tool-icon {
  @include treeToolbar.tool-icon;
}

.node-asset-tree__search-row {
  @include treeToolbar.search-row;

  display: block;
}

@include treeToolbar.search-transition('x-tree-search');

.node-asset-tree__search-control {
  @include treeToolbar.search-control;
}

.node-asset-tree__search-input {
  width: 100%;
}

.node-asset-tree__search-control :deep(.el-input__wrapper),
.node-asset-tree__search-control :deep(.el-input__wrapper:hover),
.node-asset-tree__search-control :deep(.el-input__wrapper.is-focus),
.node-asset-tree__search-control :deep(.el-select__wrapper),
.node-asset-tree__search-control :deep(.el-select__wrapper:hover),
.node-asset-tree__search-control :deep(.el-select__wrapper.is-focused) {
  width: 100%;
  min-height: 28px;
  height: 28px;
  border: 0 !important;
  outline: none !important;
  background-color: transparent;
  box-shadow: none !important;
}

.node-asset-tree__search-control :deep(.el-input__inner) {
  height: 28px;
  font-size: 13px;
}

.node-asset-tree__search-input :deep(.el-input__suffix-inner) {
  min-width: 0;
}

.node-asset-tree__search-settings-trigger {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  outline: none;
  color: var(--el-text-color-secondary);
  background: transparent;
  cursor: pointer;

  &:hover,
  &:focus-visible,
  &[aria-expanded='true'] {
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-light);
  }

  &.is-filtered::after {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--el-color-primary);
    content: '';
  }
}

.node-asset-tree__asset-icon,
.node-asset-tree__node-icon {
  flex: none;
  width: 14px;
  margin-right: 4px;
  text-align: center;
}

.node-asset-tree__asset-icon {
  color: var(--el-color-info);
  font-size: 12px;
}

.node-asset-tree__platform-icon {
  display: inline-block;
  height: 14px;
  object-fit: contain;
}

.node-asset-tree__node-tools {
  position: sticky;
  right: 4px;
  z-index: 2;
  display: inline-flex;
  flex: none;
  align-items: center;
  width: 22px;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s ease;
}

.node-asset-tree__node-tools-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  outline: none;
  color: var(--el-text-color-secondary);
  background: transparent;
  cursor: pointer;

  .el-icon {
    font-size: 12px;
    transform: rotate(90deg);
  }

  &:hover,
  &:focus-visible,
  &[aria-expanded='true'] {
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-dark);
  }
}

.node-asset-tree :deep(.el-tree-node__content:hover) .node-asset-tree__node-tools,
.node-asset-tree__node-tools:has(.node-asset-tree__node-tools-trigger[aria-expanded='true']) {
  opacity: 1;
  pointer-events: auto;
}

.node-asset-tree :deep(.el-tree-node__content:hover) .node-asset-tree__node-tools {
  background: var(--el-fill-color-light);
}

.node-asset-tree
  :deep(.el-tree-node.is-current > .el-tree-node__content:hover)
  .node-asset-tree__node-tools {
  background: var(--el-color-primary-light-9);
}

.node-asset-tree :deep(.el-tree-node__content) {
  border-radius: 6px;
}

.node-asset-tree :deep(.x-tree__header-actions) {
  display: none;
}

.node-asset-tree :deep(.el-tree-node.is-expanded > .el-tree-node__children) {
  overflow: visible !important;
}

.node-asset-tree :deep(.x-tree) {
  flex: 1 1 auto;
  height: auto;
  min-height: 0;
}

.node-asset-tree.is-search-visible :deep(.x-tree__body) {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}
</style>

<style lang="scss">
.node-asset-tree-node-tools-popper {
  min-width: 210px;
}

.node-asset-tree-node-tools-popper .node-asset-tree-node-tools__menu {
  padding: 0;
}

.node-asset-tree-search-settings-popper.el-popover {
  padding: 8px 0;
  border-color: var(--el-border-color-lighter);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

.node-asset-tree-search-settings__section {
  padding: 5px 14px 8px;
}

.node-asset-tree-search-settings__title {
  margin-bottom: 7px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 20px;
}

.node-asset-tree-search-settings__radios {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1px;
  width: 100%;
}

.node-asset-tree-search-settings__target-option {
  position: relative;
  width: 100%;
}

.node-asset-tree-search-settings__target-option .el-radio {
  align-items: flex-start;
  width: 100%;
  min-height: 30px;
  height: auto;
  margin-right: 0;
  padding: 6px 4px;
  border-radius: 4px;
  color: var(--el-text-color-regular);
}

.node-asset-tree-search-settings__target-option .el-radio:hover {
  background: var(--el-fill-color-light);
}

.node-asset-tree-search-settings__target-option .el-radio__input {
  margin-top: 2px;
}

.node-asset-tree-search-settings__target-option .el-radio__label {
  min-width: 0;
  padding-left: 9px;
  padding-right: 22px;
  overflow-wrap: anywhere;
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
}

.node-asset-tree-search-settings__submenu-arrow {
  position: absolute;
  top: 50%;
  right: 7px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  pointer-events: none;
  transform: translateY(-50%);
}

.node-asset-tree-search-settings__asset-submenu {
  position: absolute;
  top: 0;
  left: calc(100% + 20px);
  z-index: 1;
  display: flex;
  align-items: center;
  width: max-content;
  min-width: 166px;
  min-height: 38px;
  padding: 4px 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  box-sizing: border-box;
  background: var(--el-bg-color-overlay);
  box-shadow: var(--el-box-shadow-light);
}

.node-asset-tree-search-settings__asset-option {
  width: 100%;
  height: 30px;
  margin: 0;
  padding: 0 6px;
  color: var(--el-text-color-regular);
}

.node-asset-tree-search-settings__asset-option .el-checkbox__label {
  padding-left: 9px;
  font-size: 13px;
  font-weight: 400;
}

.node-asset-tree-node-tools-popper .el-dropdown-menu__item {
  min-height: 32px;
  padding: 0 10px;
}

.node-asset-tree-node-tools-popper .el-dropdown-menu__item.is-selected {
  color: var(--el-color-primary);
}

.node-asset-tree-node-tools__radio {
  position: relative;
  flex: none;
  width: 14px;
  height: 14px;
  margin-right: 10px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color);
  border-radius: 50%;
  background: var(--el-bg-color-overlay, #fff);
}

.node-asset-tree-node-tools-popper
  .el-dropdown-menu__item.is-selected
  .node-asset-tree-node-tools__radio {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary);
}

.node-asset-tree-node-tools-popper
  .el-dropdown-menu__item.is-selected
  .node-asset-tree-node-tools__radio::after {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #fff;
  content: '';
}
</style>
