<template>
  <div ref="listRoot" class="list-table" :class="{ 'list-table--fill-height': resolvedFillHeight }">
    <QuickFilter
      v-if="iHasQuickFilter"
      v-model:expand="filterExpand"
      :filters="quickFilters"
      :summary="quickSummary"
      :table-url="tableUrl"
      @filter="filter"
    />
    <TableAction
      v-bind="iHeaderActions"
      v-if="hasActions"
      v-model:quick-filter-expand="filterExpand"
      ref="tableAction"
      :class="{ 'filter-expand': filterExpand }"
      :date-pick="handleDateChange"
      :has-quick-filter="iHasQuickFilter"
      :reload-table="reloadTable"
      :search-table="search"
      :selected-rows="selectedRows"
      :get-table-metadata="getTableMetadata"
      :table-url="tableUrl"
      @done="handleActionInitialDone"
    >
      <template v-if="$slots['search-after']" #search-after>
        <slot name="search-after" />
      </template>
    </TableAction>
    <div v-loading="!actionInit" class="table-content compact-loading">
      <IBox>
        <AutoDataTable
          v-bind="$attrs"
          v-if="actionInit"
          ref="dataTable"
          :config="iTableConfig"
          :fill-height="resolvedFillHeight"
          :filter-table="filter"
          :get-table-metadata="getTableMetadata"
          @loaded="handleTableLoaded"
          @selection-change="handleSelectionChange"
        />
      </IBox>
    </div>
  </div>
</template>

<script>
import { getResourceFromApiUrl } from '@/utils/jms/index'
import deepmerge from 'deepmerge'
import { mapGetters } from 'vuex'
import { computed, provide } from 'vue'
import IBox from '@/components/Common/IBox/index.vue'
import TableAction from './TableAction/index.vue'
import AutoDataTable from '../AutoDataTable/index.vue'
import QuickFilter from './TableAction/QuickFilter.vue'
import { useListTableViewport } from './useListTableViewport'
import { getDayEnd, getDaysAgo } from '@/utils/common/time'
import { ObjectLocalStorage } from '@/utils/common/objectLocalStorage'
import isFalsey from '@/components/Table/DataTable/compenents/el-data-table/utils/is-falsey'
import i18n from '@/i18n/i18n'
import _ from 'lodash'

const LIST_TABLE_KEY = Symbol('listTable')
const ACTIVATION_REFRESH_POLICIES = ['always', 'route-change', 'never']

export { LIST_TABLE_KEY }

export default {
  name: 'ListTable',
  components: {
    QuickFilter,
    AutoDataTable,
    TableAction,
    IBox
  },
  emits: [
    'loaded',
    'query-change',
    'selection-change',
    'tag-date-change',
    'tag-filter',
    'tag-search'
  ],
  setup(props) {
    // Provide list table instance to child components
    // This replaces $parent chain access
    const listTableContext = {
      dataTable: null,
      tableConfig: null
    }
    provide(LIST_TABLE_KEY, listTableContext)
    const { listRoot, fillHeight: viewportFillHeight } = useListTableViewport()
    const resolvedFillHeight = computed(() => props.fillHeight || viewportFillHeight.value)
    return { listTableContext, listRoot, resolvedFillHeight }
  },
  props: {
    // Embedded lists can opt into the same fixed-header/body-scroll layout as pages.
    fillHeight: {
      type: Boolean,
      default: false
    },
    // 定义 table 的配置
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    // 是否显示table左侧的action
    headerActions: {
      type: Object,
      default: () => ({})
    },
    quickFilters: {
      type: Array,
      default: () => null
    },
    quickSummary: {
      type: Array,
      default: () => null
    },
    tableMetadataProvider: {
      type: Function,
      default: null
    },
    activationRefresh: {
      type: String,
      default: 'route-change',
      validator: (value) => ACTIVATION_REFRESH_POLICIES.includes(value)
    }
  },
  data() {
    const order = this.$route?.params?.order
    let extraQuery = {
      ...(order && { order })
    }
    if (this.headerActions.hasDatePicker) {
      const datePicker = this.headerActions.datePicker || {}
      extraQuery = {
        ...extraQuery,
        date_from: datePicker.dateStart || getDaysAgo(7).toISOString(),
        date_to: datePicker.dateEnd || this.$moment(getDayEnd()).add(1, 'day').toISOString()
      }
      this.headerActions.datePicker = Object.assign(
        {
          dateStart: extraQuery.date_from,
          dateEnd: extraQuery.date_to
        },
        this.headerActions.datePicker
      )
    }
    if (this.$route.query.order) {
      extraQuery['order'] = this.$route.query.order
    }
    return {
      selectedRows: [],
      init: false,
      activationRoutes: {},
      activationPending: false,
      extraQuery: extraQuery,
      actionInit: this.headerActions.has === false,
      initQuery: {},
      tablePath: new URL(this.tableConfig.url || '', 'http://127.0.0.1').pathname,
      objStorage: new ObjectLocalStorage('filterExpand'),
      iFilterExpand: null,
      reloadTable: _.debounce(this._reloadTable, 300),
      searchQuery: {},
      filterQuery: {},
      lastEmittedQuery: null,
      metadataRequestUrl: '',
      metadataRequest: null
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot']),
    filterExpand: {
      get() {
        if (this.iFilterExpand !== null) {
          return this.iFilterExpand
        }
        return this.objStorage.get(this.tablePath)
      },
      set(val) {
        this.iFilterExpand = val
        this.objStorage.set(this.tablePath, val)
      }
    },
    iHasQuickFilter() {
      const has =
        (this.quickFilters && this.quickFilters.length > 0) ||
        (this.quickSummary && this.quickSummary.length > 0)

      return !!has
    },
    dataTable() {
      return this.$refs.dataTable?.$refs.dataTable
    },
    iHeaderActions() {
      // 如果路由中锁定了 root 组织，就不在检查 root 组织下是否可以创建等
      const checkRoot = !(this.$route.meta?.disableOrgsChange === true)
      const actions = {
        canCreate: { action: 'add', checkRoot: checkRoot },
        canBulkDelete: { action: 'delete', checkRoot: false },
        canBulkUpdate: { action: 'change', checkRoot: checkRoot },
        hasImport: { action: 'add|change', checkRoot: checkRoot },
        hasExport: { action: 'view', checkRoot: false }
      }
      const defaults = {}
      for (const [k, v] of Object.entries(actions)) {
        const hasPerm = v.action.split('|').some((i) => this.hasActionPerm(i.trim()))
        if (!hasPerm) {
          defaults[k] = i18n.global.t('NoPermission')
          continue
        }
        if (v.checkRoot && this.currentOrgIsRoot) {
          defaults[k] = i18n.global.t('NoPermissionInGlobal')
          continue
        }
        defaults[k] = true
      }
      defaults.handleTableSettingClick = this.handleTableSettingClick
      return Object.assign(defaults, this.headerActions)
    },
    hasActions() {
      return this.iHeaderActions.has === undefined ? true : this.iHeaderActions.has
    },
    iTableConfig() {
      // Keep formatter component identities stable when only the URL changes.
      // Clone only the metadata we write below, not the Vue component definitions.
      const config = {
        ...this.tableConfig,
        extraQuery: deepmerge(this.tableConfig.extraQuery || {}, this.extraQuery),
        columnsMeta: { ...this.tableConfig.columnsMeta }
      }
      for (const name of ['name', 'actions']) {
        const meta = config.columnsMeta[name]
        config.columnsMeta[name] = {
          ...meta,
          formatterArgs: { ...meta?.formatterArgs }
        }
      }
      const checkRoot = !(this.$route.meta?.disableOrgsChange === true)
      const checkPermAndRoot = (action) => {
        if (!this.hasActionPerm(action)) {
          return i18n.global.t('NoPermission')
        }
        if (checkRoot && this.currentOrgIsRoot) {
          return i18n.global.t('NoPermissionInGlobal')
        }
        return true
      }
      const formatterArgs = {
        'columnsMeta.actions.formatterArgs.canUpdate': () => {
          return checkPermAndRoot('change')
        },
        'columnsMeta.actions.formatterArgs.canDelete': 'delete',
        'columnsMeta.actions.formatterArgs.canClone': () => {
          return checkPermAndRoot('add')
        },
        'columnsMeta.name.formatterArgs.can': 'view'
      }

      for (const [arg, action] of Object.entries(formatterArgs)) {
        const notSet = _.get(config, arg) === undefined
        const isFunction = typeof action === 'function'
        if (notSet) {
          const hasActionPerm = isFunction ? action() : this.hasActionPerm(action)
          _.set(config, arg, hasActionPerm)
        }
      }
      this.$log.debug('Header actions', this.headerActions)
      this.$log.debug('ListTable: iTableConfig change', config)
      return config
    },
    tableUrl() {
      return this.tableConfig.url || ''
    },
    permissions() {
      // 获取 permissions，获取不到通过 url 解析
      const permissions = this.tableConfig.permissions || {}
      const { app: apiApp, resource: apiResource } = getResourceFromApiUrl(this.tableUrl)
      const app = permissions.app || apiApp
      const resource = permissions.resource || apiResource
      const actions = ['add', 'change', 'delete', 'view']
      const defaultPermissions = actions.reduce((result, action) => {
        result[action] = `${app}.${action}_${resource}`
        return result
      }, {})
      const perms = Object.assign(defaultPermissions, permissions)
      // this.$log.debug('Permissions: ', perms)
      return perms
    }
  },
  watch: {
    extraQuery: {
      handler() {
        this.$log.debug('ListTable: found extraQuery change')
        this.emitQueryChange()
      },
      deep: true
    },
    'tableConfig.extraQuery': {
      handler() {
        this.emitQueryChange()
      },
      deep: true
    },
    tableColConfig: {
      handler() {
        this.$log.debug('ListTable: found colConfig change')
      },
      deep: true
    }
  },
  mounted() {
    this.activationRoutes[this.getTableResourceKey()] = this.getActivationRouteKey()
    // Populate the provided context with component references.
    // Note: $refs.dataTable is AutoDataTable, whose inner DataTable is rendered
    // with `v-if="!loading"` and mounts only after its OPTIONS metadata loads —
    // later than this parent's mounted(). Expose it as a live getter (not a
    // one-time snapshot) so consumers like ExportDialog always resolve the
    // real DataTable once it exists.
    Object.defineProperty(this.listTableContext, 'dataTable', {
      get: () => this.$refs.dataTable?.$refs.dataTable,
      enumerable: true,
      configurable: true
    })
    Object.defineProperty(this.listTableContext, 'tableConfig', {
      get: () => this.tableConfig,
      enumerable: true
    })
    this.emitQueryChange()
  },
  beforeUnmount() {
    this.reloadTable.cancel()
  },
  deactivated() {
    this.activationPending = true
  },
  activated() {
    if (!this.activationPending) {
      return
    }
    this.activationPending = false
    this.$nextTick(this.handleActivationRefresh)
  },
  methods: {
    handleActivationRefresh() {
      const tableResourceKey = this.getTableResourceKey()
      const previousRouteKey = this.activationRoutes[tableResourceKey]
      const currentRouteKey = this.getActivationRouteKey()
      this.activationRoutes[tableResourceKey] = currentRouteKey

      if (this.activationRefresh === 'never') {
        return
      }
      if (
        this.activationRefresh === 'route-change' &&
        (!previousRouteKey || previousRouteKey === currentRouteKey)
      ) {
        return
      }
      this.$log.debug('Reload the table on activation', {
        policy: this.activationRefresh,
        previousRouteKey,
        currentRouteKey
      })
      this._reloadTable()
    },
    getTableResourceKey() {
      return this.tableUrl.split(/[?#]/, 1)[0]
    },
    getActivationRouteKey() {
      const query = { ...this.$route.query }
      delete query.tab
      return this.$router.resolve({
        path: this.$route.path,
        query,
        hash: this.$route.hash
      }).fullPath
    },
    getTableMetadata() {
      if (!this.tableUrl) {
        return Promise.resolve({})
      }
      // OPTIONS describes the resource schema. List filters such as node_id,
      // category and pagination only affect GET data and must not create a new
      // metadata cache entry whenever the user changes the current tree node.
      const resourceUrl = this.tableUrl.split(/[?#]/, 1)[0]
      const url = `${resourceUrl}?display=1`
      if (this.metadataRequest && this.metadataRequestUrl === url) {
        return this.metadataRequest
      }

      this.metadataRequestUrl = url
      const request = this.tableMetadataProvider
        ? this.tableMetadataProvider(url)
        : this.$store.dispatch('common/getUrlMeta', { url })
      const sharedRequest = request.catch((error) => {
        if (this.metadataRequest === sharedRequest) {
          this.metadataRequest = null
          this.metadataRequestUrl = ''
        }
        throw error
      })
      this.metadataRequest = sharedRequest
      return this.metadataRequest
    },
    focusSearch() {
      return this.$refs.tableAction?.focusSearch()
    },
    closeNodeSearch() {
      return this.$refs.tableAction?.closeNodeSearch()
    },
    handleTableSettingClick() {
      this.$refs.dataTable?.openColumnSetting()
    },
    handleFilterExpandChanged(expand) {
      this.filterExpand = expand
    },
    handleQuickFilter(option) {
      if (option.route) {
        this.$router.push(option.route)
        return
      }
      if (option.filter) {
        const filter = { ...option.filter }
        if (option.active) {
          for (const key in filter) {
            filter[key] = ''
          }
        }
        this.filter(option.filter)
        return
      }
      if (option.callback) {
        option.callback(option.active)
      }
    },
    handleActionInitialDone() {
      this.actionInit = true
      this.emitQueryChange()
    },
    handleSelectionChange(val) {
      this.selectedRows = Array.isArray(val) ? [...val] : []
      this.$emit('selection-change', this.selectedRows)
    },
    _reloadTable() {
      this.dataTable?.getList()
    },
    updateInitQuery() {
      const tableReady = Boolean(this.$refs.dataTable?.$refs.dataTable)
      if (!this.actionInit || !tableReady) {
        const query = this.getMergedQuery()
        for (const key of Object.keys(this.initQuery)) {
          if (isFalsey(query[key])) {
            delete this.extraQuery[key]
          }
        }
        this.initQuery = { ...query }
        for (const key in query) {
          this.extraQuery[key] = query[key]
        }
        return true
      }
      for (const key of Object.keys(this.initQuery)) {
        delete this.extraQuery[key]
      }
      this.initQuery = {}
      return false
    },
    getMergedQuery() {
      return { ...this.searchQuery, ...this.filterQuery }
    },
    normalizeQuery(query) {
      return Object.keys(query || {})
        .filter((key) => !isFalsey(query[key]))
        .reduce((result, key) => {
          result[key] = query[key].toString().trim()
          return result
        }, {})
    },
    getEffectiveQuery() {
      const extraQuery = deepmerge(this.tableConfig.extraQuery || {}, this.extraQuery)
      return this.normalizeQuery({
        ...extraQuery,
        ...this.getMergedQuery()
      })
    },
    emitQueryChange() {
      if (this.hasActions && !this.actionInit) {
        return
      }
      const query = this.getEffectiveQuery()
      if (_.isEqual(query, this.lastEmittedQuery)) {
        return
      }
      this.lastEmittedQuery = _.cloneDeep(query)
      this.$emit('query-change', query)
    },
    search(attrs = {}) {
      this.searchQuery = attrs || {}
      const init = this.updateInitQuery()
      this.$log.debug('ListTable: search table', attrs)
      this.$emit('tag-search', attrs)
      this.emitQueryChange()
      if (init) {
        return
      }
      const merged = this.getMergedQuery()
      this.$refs.dataTable?.$refs.dataTable?.search(merged, true)
    },
    filter(attrs = {}) {
      this.filterQuery = attrs || {}
      const init = this.updateInitQuery()
      const merged = this.getMergedQuery()
      this.$emit('tag-filter', attrs)
      this.emitQueryChange()
      this.$log.debug('ListTable: found filter change', attrs)
      if (init) {
        return
      }
      this.$refs.dataTable?.$refs.dataTable?.search(merged, true)
    },
    hasActionPerm(action) {
      const permRequired = this.permissions[action]
      return this.$hasPerm(permRequired)
    },
    handleDateChange(attrs) {
      let dateFrom = ''
      let dateTo = ''
      try {
        dateFrom = attrs[0].toISOString()
        dateTo = attrs[1].toISOString()
      } catch (e) {
        this.$log.error('Handle date change error: ', attrs)
        dateFrom = new Date()
        dateFrom.setDate(dateFrom.getDate() - 5)
        dateFrom = dateFrom.toISOString()
        dateTo = new Date()
        dateTo.setDate(dateTo.getDate() + 1)
        dateTo = dateTo.toISOString()
      }
      this.extraQuery['date_from'] = dateFrom
      this.extraQuery['date_to'] = dateTo
      const query = {
        date_from: dateFrom,
        date_to: dateTo
      }
      this.$emit('tag-date-change', attrs)
      this.emitQueryChange()
      return this.dataTable?.searchDate(query)
    },
    handleTableLoaded(payload = {}) {
      const event = {
        ...payload,
        query: this.getEffectiveQuery(),
        requestQuery: payload.query || {},
        url: this.tableUrl
      }
      this.$emit('loaded', event)
    },
    toggleRowSelection(row, isSelected) {
      return this.dataTable.toggleRowSelection(row, isSelected)
    }
  }
}
</script>

<style lang="scss" scoped>
.list-table {
  --list-corner-radius: 4px;

  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.list-table .table-content {
  min-width: 0;

  > :deep(.ibox) {
    // Element Plus transitions all card properties by default, including the
    // flex sizing applied when a list fills its page. Never animate that layout.
    transition: none;
    // The outer card owns the list border and rounded corners. Clip the inner
    // table so its square layers cannot interrupt the four corner arcs.
    overflow: hidden !important;
  }

  :deep(.el-card__body) {
    padding: 0;
  }

  :deep(.el-data-table__body > .el-table),
  :deep(.el-table__inner-wrapper) {
    border-radius: 0;
  }

  :deep(.el-data-table__body > .el-table--border) {
    &::before,
    &::after {
      display: none;
    }

    > .el-table__inner-wrapper > .el-table__border-left-patch,
    > .el-table__inner-wrapper > .el-table__border-right-patch,
    > .el-table__inner-wrapper > .el-table__border-bottom-patch {
      display: none;
    }

    tr > .el-table__cell:last-child {
      border-right: 0 !important;
    }
  }

  :deep(.el-table__row .cell) {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  :deep(.el-table__expanded-cell pre) {
    max-height: 500px;
    overflow-y: scroll;
  }

  // .el-button-ungroup .el-dropdown > .more-action {
  //   height: 24.6px;
  // }
}

//修改颜色
.el-button--text {
  color: var(--color-primary);
}
</style>
