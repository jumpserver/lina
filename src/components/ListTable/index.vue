<template>
  <div>
    <TableAction
      :table-url="tableUrl"
      :search-table="search"
      :date-pick="handleDateChange"
      :selected-rows="selectedRows"
      :reload-table="reloadTable"
      v-bind="iHeaderActions"
    />
    <IBox class="table-content">
      <AutoDataTable
        ref="dataTable"
        :filter-table="filter"
        :config="iTableConfig"
        @selection-change="handleSelectionChange"
        v-on="$listeners"
      />
    </IBox>
  </div>
</template>

<script>
import AutoDataTable from '../AutoDataTable'
import IBox from '../IBox'
import TableAction from './TableAction'
import Emitter from '@/mixins/emitter'
import { getResourceFromApiUrl } from '@/utils/jms'
import deepmerge from 'deepmerge'
import { mapGetters } from 'vuex'

export default {
  name: 'ListTable',
  components: {
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
    }
  },
  data() {
    return {
      selectedRows: [],
      init: false,
      extraQuery: {}
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot']),
    dataTable() {
      return this.$refs.dataTable.$refs.dataTable
    },
    iHeaderActions() {
      const actions = {
        canCreate: { action: 'add', checkRoot: true },
        canBulkDelete: { action: 'delete', checkRoot: false },
        canBulkUpdate: { action: 'change', checkRoot: true },
        hasImport: { action: 'add', checkRoot: true },
        hasExport: { action: 'view', checkRoot: false }
      }
      const defaults = {}
      for (const [k, v] of Object.entries(actions)) {
        defaults[k] = this.hasActionPerm(v.action)
        if (v.checkRoot) {
          defaults[k] = defaults[k] && !this.currentOrgIsRoot
        }
      }
      return Object.assign(defaults, this.headerActions)
    },
    iTableConfig() {
      const config = deepmerge(this.tableConfig, {
        extraQuery: this.extraQuery
      })
      const formatterArgs = {
        'columnsMeta.actions.formatterArgs.canUpdate': 'change',
        'columnsMeta.actions.formatterArgs.canDelete': 'delete',
        'columnsMeta.actions.formatterArgs.canClone': 'add',
        'columnsMeta.name.formatterArgs.can': 'view'
      }
      for (const [arg, action] of Object.entries(formatterArgs)) {
        const notSet = _.get(config, arg) === undefined
        if (notSet) {
          _.set(config, arg, this.hasActionPerm(action))
        }
      }
      this.$log.debug('Header actions', this.headerActions)
      this.$log.debug('ListTable: iTableConfig change', config)
      return config
    },
    tableUrl() {
      return this.tableConfig.url
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
  methods: {
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    reloadTable() {
      this.dataTable.getList()
    },
    search(attrs) {
      this.$emit('TagSearch', attrs)
      return this.dataTable?.search(attrs, true)
    },
    filter(attrs) {
      this.$emit('TagFilter', attrs)
      this.$refs.dataTable.$refs.dataTable.search(attrs, true)
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

.table-content {
  margin-top: 10px;

  & >>> .el-card__body {
    padding: 0;
  }
  & >>> .el-table__header thead > tr > th {
    background-color: white;
  }
  &>>> .el-table__row .cell {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  &>>> .el-table__expanded-cell pre {
    max-height: 500px;
    overflow-y: scroll;
  }
}

//修改颜色
// .el-button--text{
//   color: #409EFF;
// }
</style>
