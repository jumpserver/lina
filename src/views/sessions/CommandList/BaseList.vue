<template>
  <TreeTable
    ref="CommandTreeTable"
    v-loading="loading"
    :header-actions="headerActions"
    :table-config="tableConfig"
    :tree-setting="treeSetting"
    class="command-list-table"
    @TagDateChange="handleDateChange"
    @TagFilter="handleFilterChange"
    @TagSearch="handleTagChange"
    @TreeInitFinish="checkFirstNode"
  />
</template>

<script>
import TreeTable from '@/components/Table/TreeTable/index.vue'
import { getDayEnd, getDaysAgo, toSafeLocalDateStr } from '@/utils/common'
import { OutputExpandFormatter } from '../formatters'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import isFalsey from '@/components/Table/DataTable/compenents/el-data-table/utils/is-falsey'
import deepmerge from 'deepmerge'
import * as queryUtil from '@/components/Table/DataTable/compenents/el-data-table/utils/query'
import { createSourceIdCache } from '@/api/common'
import { download } from '@/utils/common'

export default {
  name: 'CommandList',
  components: {
    TreeTable
  },
  props: {
    assetId: {
      type: String,
      default: () => ''
    }
  },
  data() {
    const vm = this
    const dateFrom = getDaysAgo(7).toISOString()
    const dateTo = this.$moment(getDayEnd()).add(1, 'day').toISOString()
    return {
      loading: true,
      tableConfig: {
        url: '',
        tableAttrs: {
          rowClassName: ({ row }) => {
            if (row.risk_level === 5) {
              return 'risk-command'
            }
            return 'command'
          }
        },
        columns: [
          'expandCol', 'input', 'risk_level', 'user', 'remote_addr',
          'asset', 'account', 'session', 'timestamp'
        ],
        extraQuery: {
          date_to: dateTo,
          date_from: dateFrom
        },
        columnsMeta: {
          expandCol: {
            type: 'expand',
            prop: 'output',
            label: '',
            formatter: OutputExpandFormatter
          },
          risk_level: {
            label: this.$t('sessions.riskLevel'),
            width: '105px',
            formatter: (row, col, cellValue) => {
              const display = row['risk_level'].label
              if (cellValue?.value === 0) {
                return display
              } else {
                return <span class='text-danger'> {display} </span>
              }
            }
          },
          actions: {
            has: false
          },
          asset: {
            width: '140px'
          },
          user: {
            width: '140px'
          },
          session: {
            label: this.$t('sessions.session'),
            formatter: DetailFormatter,
            width: '80px',
            formatterArgs: {
              openInNewPage: true,
              removeColorOnClick: true,
              can: this.$hasPerm('terminal.view_session'),
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
        hasExport: this.$hasPerm('terminal.view_command'),
        hasDatePicker: true,
        datePicker: {
          dateStart: dateFrom,
          dateEnd: dateTo
        },
        canExportSelected: true,
        exportOptions: {
          performExport: async(selectRows, exportOption, q, exportTypeOption) => {
            let url = this.tableConfig.url
            url = (process.env.VUE_APP_ENV === 'production') ? (`${url}`) : (`${process.env.VUE_APP_BASE_API}${url}`)
            const query = { ...q }
            if (exportOption === 'selected') {
              const resources = []
              for (const item of selectRows) {
                resources.push(item.id)
              }
              const spm = await createSourceIdCache(resources)
              query['spm'] = spm.spm
            }
            query['format'] = exportTypeOption
            const queryStr =
              (url.indexOf('?') > -1 ? '&' : '?') +
              queryUtil.stringify(query, '=', '&')
            url = url + queryStr
            this.$log.debug('Export url: ', this.url, '=>', url)
            download(url + queryStr)
          }
        }
      },
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showAssets: false,
        // ?assets=0不显示资产. =1显示资产
        treeUrl: `/api/v1/terminal/command-storages/tree/?real=1&date_from=${dateFrom}&date_to=${dateTo}&asset_id=${this.assetId}`,
        view: {
          // 添加禁用颜色区分
          fontCss: (treeId, treeNode) => {
            if (treeNode.chkDisabled) {
              return { opacity: '0.4' }
            }
            return {}
          }
        },
        callback: {
          onSelected: (event, treeNode) => {
            // 禁止点击根节点
            if (treeNode.id === 'root') {
              return
            }
            if (!treeNode.valid) {
              this.$message.error(this.$tc('sessions.EsDisabled'))
              return
            }
            this.tableConfig.url = `/api/v1/terminal/commands/?command_storage_id=${treeNode.id}&order=-timestamp`
            if (this.assetId) {
              this.tableConfig.url += `&asset_id=${this.assetId}`
            }
          }
        }
      }
    }
  },
  computed: {
    treeTable() {
      return this.$refs.CommandTreeTable
    }
  },
  watch: {},
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
      const url = `/api/v1/terminal/command-storages/tree/?real=1&asset_id=${this.assetId}`
      const queryStr = (url.indexOf('?') > -1 ? '&' : '?') + queryUtil.stringify(_query, '=', '&')
      const treeUrl = url + queryStr
      this.$set(this.treeSetting, 'treeUrl', treeUrl)
    },
    handleFilterChange(query) {
      const _query = this.cleanUrl(query)
      const url = `/api/v1/terminal/command-storages/tree/?real=1&asset_id=${this.assetId}`
      const queryStr = (url.indexOf('?') > -1 ? '&' : '?') + queryUtil.stringify(_query, '=', '&')
      const treeUrl = url + queryStr
      this.$set(this.treeSetting, 'treeUrl', treeUrl)
    },
    handleDateChange(object) {
      this.query = {
        date_from: object[0].toISOString(),
        date_to: object[1].toISOString()
      }
      const url = `/api/v1/terminal/command-storages/tree/?real=1&asset_id=${this.assetId}`
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

<style lang="scss" scoped>
.command-list-table > > > .risk-command {
  background-color: oldlace;

  tr {
    color: white;
  }
}

</style>
