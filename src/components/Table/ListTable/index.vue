<template>
  <div>
    <QuickFilter
      :expand.sync="filterExpand"
      :filters="quickFilters"
      :summary="quickSummary"
      :table-url="tableUrl"
      @filter="filter"
    />
    <TableAction
      v-if="hasActions"
      :class="{'filter-expand': filterExpand}"
      :date-pick="handleDateChange"
      :has-quick-filter="iHasQuickFilter"
      :quick-filter-expand.sync="filterExpand"
      :reload-table="reloadTable"
      :search-table="search"
      :selected-rows="selectedRows"
      :table-url="tableUrl"
      v-bind="iHeaderActions"
      @done="handleActionInitialDone"
    />
    <IBox v-loading="!actionInit" class="table-content">
      <AutoDataTable
        v-if="actionInit"
        ref="dataTable"
        :config="iTableConfig"
        :filter-table="filter"
        v-on="$listeners"
        @selection-change="handleSelectionChange"
      />
    </IBox>
  </div>
</template>

<script>
import { getResourceFromApiUrl } from '@/utils/jms'
import deepmerge from 'deepmerge'
import { mapGetters } from 'vuex'
import IBox from '@/components/Common/IBox/index.vue'
import TableAction from './TableAction/index.vue'
import Emitter from '@/mixins/emitter'
import AutoDataTable from '../AutoDataTable/index.vue'
import QuickFilter from './TableAction/QuickFilter.vue'
import { getDayEnd, getDaysAgo } from '@/utils/time'
import { ObjectLocalStorage } from '@/utils/common'

export default {
  name: 'ListTable',
  components: {
    QuickFilter,
    AutoDataTable,
    TableAction,
    IBox
  },
  mixins: [Emitter],
  props: {
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
    }
  },
  data() {
    const order = this.$route?.params?.order
    let extraQuery = {
      ...(order && { order })
    }
    if (this.headerActions.hasDatePicker) {
      extraQuery = {
        ...extraQuery,
        date_from: getDaysAgo(7).toISOString(),
        date_to: this.$moment(getDayEnd()).add(1, 'day').toISOString()
      }
      this.headerActions.datePicker = Object.assign({
        dateStart: extraQuery.date_from,
        dateEnd: extraQuery.date_to
      }, this.headerActions.datePicker)
    }
    if (this.$route.query.order) {
      extraQuery['order'] = this.$route.query.order
    }
    return {
      selectedRows: [],
      init: false,
      urlUpdated: {},
      isDeactivated: false,
      extraQuery: extraQuery,
      actionInit: this.headerActions.has === false,
      initQuery: {},
      tablePath: new URL(this.tableConfig.url || '', 'http://127.0.0.1').pathname,
      objStorage: new ObjectLocalStorage('filterExpand'),
      iFilterExpand: null,
      reloadTable: _.debounce(this._reloadTable, 300)
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
        const hasPerm = v.action.split('|').some(i => this.hasActionPerm(i.trim()))
        if (!hasPerm) {
          defaults[k] = this.$t('NoPermission')
          continue
        }
        if (v.checkRoot && this.currentOrgIsRoot) {
          defaults[k] = this.$t('NoPermissionInGlobal')
          continue
        }
        defaults[k] = true
      }
      return Object.assign(defaults, this.headerActions)
    },
    hasActions() {
      return this.iHeaderActions.has === undefined ? true : this.iHeaderActions.has
    },
    iTableConfig() {
      if (this.isDeactivated) {
        return
      }
      const config = deepmerge(this.tableConfig, {
        extraQuery: this.extraQuery
      })
      const checkRoot = !(this.$route.meta?.disableOrgsChange === true)
      const checkPermAndRoot = (action) => {
        if (!this.hasActionPerm(action)) {
          return this.$t('NoPermission')
        }
        if (checkRoot && this.currentOrgIsRoot) {
          return this.$t('NoPermissionInGlobal')
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
    this.$set(this.urlUpdated, this.tableUrl, location.href)
  },
  deactivated() {
    this.isDeactivated = true
  },
  activated() {
    this.$nextTick(() => {
      this.isDeactivated = false
      const cleanUrl = this.tableUrl.split('?')[0]
      const preURL = this.urlUpdated[cleanUrl]

      if (!preURL || preURL === location.href) return

      this.$set(this.urlUpdated, this.tableUrl, location.href)
      this.$log.debug('Reload the table get latest data: pre ', preURL, ' current: ', location.href)
      this.reloadTable()
    })
  },
  methods: {
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
      setTimeout(() => {
        this.actionInit = true
      }, 100)
    },
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    _reloadTable() {
      this.dataTable?.getList()
    },
    updateInitQuery(attrs) {
      if (!this.actionInit) {
        this.initQuery = attrs
        for (const key in attrs) {
          this.$set(this.extraQuery, key, attrs[key])
        }
        return true
      }
      const removeKeys = Object.keys(this.initQuery).filter(key => !attrs[key])
      for (const key of removeKeys) {
        this.$delete(this.extraQuery, key)
      }
    },
    search(attrs) {
      const init = this.updateInitQuery(attrs)
      if (init) {
        return
      }
      this.$log.debug('ListTable: search table', attrs)
      this.$emit('TagSearch', attrs)
      this.$refs.dataTable?.$refs.dataTable?.search(attrs, true)
    },
    filter(attrs) {
      this.$emit('TagFilter', attrs)
      this.$log.debug('ListTable: found filter change', attrs)
      this.search(attrs)
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
      this.$set(this.extraQuery, 'date_from', dateFrom)
      this.$set(this.extraQuery, 'date_to', dateTo)
      const query = {
        date_from: dateFrom,
        date_to: dateTo
      }
      this.$emit('TagDateChange', attrs)
      return this.dataTable.searchDate(query)
    },
    toggleRowSelection(row, isSelected) {
      return this.dataTable.toggleRowSelection(row, isSelected)
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-expand {
  &::v-deep button.actionFilter {
    background-color: rgb(0, 0, 0, 0.08) !important;
  }
}

.table-content {
  margin-top: 10px;

  ::v-deep {
    .el-card__body {
      padding: 0;
    }

    .el-table__row .cell {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .el-table__expanded-cell pre {
      max-height: 500px;
      overflow-y: scroll;
    }

    .el-button-ungroup .el-dropdown > .more-action {
      //height: 24.6px;
    }
  }
}

//修改颜色
.el-button--text {
  color: #409EFF;
}
</style>
