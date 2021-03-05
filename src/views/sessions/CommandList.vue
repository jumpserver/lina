<template>
  <div v-loading="loading">
    <GenericTreeListPage
      ref="GenericTreeListPage"
      :table-config="tableConfig"
      :header-actions="headerActions"
      :tree-setting="treeSetting"
      @TreeInitFinish="checkFirstNode"
      @TagSearch="handleTagChange"
      @TagFilter="handleFilterChange"
      @TagDateChange="handleDateChange"
    />
  </div>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage/index'
import { getDayEnd, getDaysAgo, toSafeLocalDateStr } from '@/utils/common'
import { OutputExpandFormatter } from './formatters'
import { DetailFormatter } from '@/components/ListTable/formatters'
import isFalsey from '@/components/DataTable/compenents/el-data-table/utils/is-falsey'
import deepmerge from 'deepmerge'
import * as queryUtil from '@/components/DataTable/compenents/el-data-table/utils/query'

export default {
  components: {
    GenericTreeListPage
  },
  data() {
    const vm = this
    const now = new Date()
    const dateFrom = getDaysAgo(2, now).toISOString()
    const dateTo = getDayEnd(now).toISOString()
    return {
      query: {
        date_from: getDaysAgo(2, now).toISOString(),
        date_to: getDayEnd(now).toISOString()
      },
      loading: true,
      tableConfig: {
        url: '',
        columns: [
          'expandCol', 'input', 'risk_level', 'user',
          'asset', 'system_user', 'session', 'timestamp'
        ],
        extraQuery: {
          date_to: dateTo,
          date_from: dateFrom
        },
        columnsMeta: {
          expandCol: {
            type: 'expand',
            prop: 'output',
            formatter: OutputExpandFormatter
          },
          risk_level: {
            label: this.$t('sessions.riskLevel'),
            width: '105px',
            formatter: (row, col, cellValue) => {
              const display = row.risk_level_display
              if (cellValue === 0) {
                return display
              } else {
                return <span class='text-danger'> { display } </span>
              }
            }
          },
          user: {
            width: '140px',
            showOverflowTooltip: true
          },
          asset: {
            width: '140px',
            showOverflowTooltip: true
          },
          system_user: {
            width: '140px',
            showOverflowTooltip: true
          },
          session: {
            label: this.$t('sessions.session'),
            formatter: DetailFormatter,
            width: '80px',
            formatterArgs: {
              getTitle() {
                return vm.$t('sessions.goto')
              },
              getRoute({ cellValue }) {
                return {
                  name: 'SessionDetail',
                  params: { id: cellValue }
                }
              }
            }
          },
          timestamp: {
            label: this.$t('sessions.date'),
            width: '150px',
            sortable: 'custom',
            formatter: function(row) {
              return toSafeLocalDateStr(row.timestamp * 1000)
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasDatePicker: true,
        canExportSelected: false,
        datePicker: {
          dateStart: dateFrom,
          dateEnd: dateTo
        }
      },
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showAssets: false,
        // ?assets=0不显示资产. =1显示资产
        treeUrl: `/api/v1/terminal/command-storages/tree/?real=1&date_from=${dateFrom}&date_to=${dateTo}`,
        callback: {
          onSelected: function(event, treeNode) {
            // 禁止点击根节点
            if (treeNode.id === 'root') {
              return
            }
            this.tableConfig.url = `/api/v1/terminal/commands/?command_storage_id=${treeNode.id}`
          }.bind(this)
        }
      }
    }
  },
  computed: {
    treeTable() {
      return this.$refs.GenericTreeListPage.$refs.TreeTable
    }
  },
  watch: {

  },
  methods: {
    checkFirstNode(obj) {
      const ztree = obj
      const nodes = ztree.getNodes()
      if (nodes[0].children.length > 0) {
        ztree.selectNode(nodes[0].children[0])
      }
      this.loading = false
    },
    handleTagChange(query) {
      const _query = this.cleanUrl(query)
      const url = `/api/v1/terminal/command-storages/tree/?real=1`
      const queryStr = (url.indexOf('?') > -1 ? '&' : '?') + queryUtil.stringify(_query, '=', '&')
      const treeUrl = url + queryStr
      this.$set(this.treeSetting, 'treeUrl', treeUrl)
      this.treeTable.forceRerenderTree()
    },
    handleFilterChange(query) {
      const _query = this.cleanUrl(query)
      const url = `/api/v1/terminal/command-storages/tree/?real=1`
      const queryStr = (url.indexOf('?') > -1 ? '&' : '?') + queryUtil.stringify(_query, '=', '&')
      const treeUrl = url + queryStr
      this.$set(this.treeSetting, 'treeUrl', treeUrl)
      this.treeTable.forceRerenderTree()
    },
    handleDateChange(object) {
      this.query = {
        date_from: object[0].toISOString(),
        date_to: object[1].toISOString()
      }
      console.log(this.query)
      const url = `/api/v1/terminal/command-storages/tree/?real=1`
      const queryStr = (url.indexOf('?') > -1 ? '&' : '?') + queryUtil.stringify(this.query, '=', '&')
      const treeUrl = url + queryStr
      this.$set(this.treeSetting, 'treeUrl', treeUrl)
      this.treeTable.forceRerenderTree()
    },
    cleanUrl(query) {
      query = Object.keys(query)
        .filter(k => !isFalsey(query[k]))
        .reduce((obj, k) => {
          obj[k] = query[k].toString().trim()
          return obj
        }, {})
      query = deepmerge(this.query, query)
      return query
    }
  }
}
</script>

<style>

</style>
