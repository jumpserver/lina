<template>
  <div v-loading="loading">
    <TreeTable
      ref="CommandTreeTable"
      v-model:active-menu="treeTabConfig.activeMenu"
      component="TabTree"
      :title="title"
      :header-actions="headerActions"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
      :tree-tab-config="treeTabConfig"
      :tree-initial-max-width="320"
      tree-width="20%"
      class="command-list-table"
      @tag-date-change="handleDateChange"
      @tag-filter="handleFilterChange"
      @tag-search="handleTagChange"
      @tree-init-finish="checkFirstNode"
    />
  </div>
</template>

<script lang="jsx">
import { withBaseApi } from '@/utils/env'
import TreeTable from '@/components/Table/TreeTable/index.vue'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { getDayEnd, getDaysAgo } from '@/utils/common/time'
import { OutputExpandFormatter } from '../formatters'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import isFalsey from '@/components/Table/DataTable/compenents/el-data-table/utils/is-falsey'
import * as queryUtil from '@/components/Table/DataTable/compenents/el-data-table/utils/query'
import { createSourceIdCache } from '@/api/common'
import { download } from '@/utils/common/index'
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
    const dateFrom = getDaysAgo(7).toISOString()
    const dateTo = this.$moment(getDayEnd()).add(1, 'day').toISOString()
    const treeSetting = {
      showDefaultMenu: false,
      showMenu: false,
      showRefresh: true,
      showCollapse: true,
      showSearch: true,
      showAssets: false,
      readOnly: true,
      lazyLoad: false,
      expandRootInGlobalOrg: true,
      treeUrl: '/api/v1/terminal/command-storages/tree/?real=1',
      amountPredicate: (node) => node.id !== 'root' && node.valid !== false,
      loadNodeAmounts: (nodeIds, options) => this.loadStorageAmounts(nodeIds, options),
      edit: {
        drag: {
          isMove: false
        }
      },
      callback: {
        onSelected: (_event, treeNode) => this.handleStorageSelected(treeNode)
      }
    }
    return {
      title: this.$t('CommandStorage'),
      loading: true,
      query: {
        date_from: dateFrom,
        date_to: dateTo
      },
      treeFilterQuery: {},
      treeSearchQuery: {},
      tableConfig: {
        url: '/api/v1/terminal/commands/',
        tableAttrs: {
          rowClassName: ({ row }) => {
            if (row.risk_level === 5) {
              return 'risk-command'
            }
            return 'command'
          }
        },
        columns: [
          'expandCol',
          ...(this.assetId ? ['index', 'id'] : []),
          'input',
          'risk_level',
          'user',
          'asset',
          'account',
          'session',
          'timestamp'
        ],
        columnsShow: {
          min: ['output', ...(this.assetId ? ['index'] : [])],
          default: [
            'output',
            ...(this.assetId ? ['index'] : []),
            'input',
            'risk_level',
            'user',
            'asset',
            'account',
            'session',
            'timestamp'
          ]
        },
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
          index: {
            type: 'index',
            label: this.$t('RowNumber')
          },
          risk_level: {
            formatter: (row, col, cellValue) => {
              const display = row['risk_level'].label
              if (cellValue?.value === 0) {
                return display
              } else {
                return <span class="text-danger"> {display} </span>
              }
            }
          },
          actions: {
            has: false
          },
          session: {
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              can: this.$hasPerm('terminal.view_session'),
              getRoute({ cellValue }) {
                return {
                  name: 'SessionDetail',
                  params: {
                    id: cellValue
                  }
                }
              }
            }
          },
          timestamp: {
            label: this.$t('Datetime'),
            width: 180,
            sortable: 'custom',
            formatter: function (row) {
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
        searchConfig: {
          singleChoiceFields: ['risk_level']
        },
        datePicker: {
          dateStart: dateFrom,
          dateEnd: dateTo
        },
        canExportSelected: true,
        exportOptions: {
          performExport: async (selectRows, exportOption, q, exportTypeOption) => {
            let url = withBaseApi(this.tableConfig.url)
            const query = {
              ...q
            }
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
              (url.indexOf('?') > -1 ? '&' : '?') + queryUtil.stringify(query, '=', '&')
            url = url + queryStr
            this.$log.debug('Export url: ', this.url, '=>', url)
            download(url + queryStr)
          }
        }
      },
      treeSetting,
      treeTabConfig: {
        activeMenu: 'CommandStorageTree',
        treeComponent: 'XTree',
        submenu: [
          {
            title: this.$t('CommandStorage'),
            name: 'CommandStorageTree',
            icon: 'fa-solid fa-database',
            treeComponent: 'XTree',
            treeSetting
          }
        ]
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
    handleStorageSelected(treeNode) {
      if (treeNode.id === 'root') {
        return
      }
      if (!treeNode.valid) {
        this.$message.error(this.$tc('EsDisabled'))
        return
      }
      let url = `/api/v1/terminal/commands/?command_storage_id=${treeNode.id}&order=-timestamp`
      if (this.assetId) {
        url += `&asset_id=${this.assetId}`
      }
      this.tableConfig.url = url
      this.treeTable.handleUrlChange(url)
    },
    checkFirstNode(obj) {
      const nodes = obj.getNodes()
      const firstChild = nodes[0]?.children?.[0]
      if (firstChild) {
        obj.selectNode(firstChild)
      }
      this.loading = false
    },
    loadStorageAmounts(nodeIds, { signal } = {}) {
      return this.$axios.post(
        '/api/v1/terminal/command-storages/tree-metrics/',
        { node_ids: nodeIds },
        {
          params: this.getTreeMetricsQuery(),
          signal
        }
      )
    },
    getTreeMetricsQuery() {
      return {
        ...this.query,
        ...this.treeSearchQuery,
        ...this.treeFilterQuery,
        ...(this.assetId ? { asset_id: this.assetId } : {})
      }
    },
    reloadTreeMetrics() {
      return this.treeTable?.reloadVisibleMetrics({
        fresh: true,
        resetNormal: true
      })
    },
    handleTagChange(query) {
      this.treeSearchQuery = this.cleanQuery(query)
      this.reloadTreeMetrics()
    },
    handleFilterChange(query) {
      this.treeFilterQuery = this.cleanQuery(query)
      this.reloadTreeMetrics()
    },
    handleDateChange(object) {
      this.query = {
        date_from: object[0].toISOString(),
        date_to: object[1].toISOString()
      }
      this.reloadTreeMetrics()
    },
    cleanQuery(query) {
      return Object.keys(query)
        .filter((k) => !isFalsey(query[k]))
        .reduce((obj, k) => {
          obj[k] = query[k].toString().trim()
          return obj
        }, {})
    }
  }
}
</script>

<style lang="scss" scoped>
.command-list-table :deep(.risk-command) {
  background-color: oldlace;

  tr {
    color: white;
  }
}
</style>
