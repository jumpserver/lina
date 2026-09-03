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
      @query-change="handleQueryChange"
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
    const initialQuery = {
      date_from: dateFrom,
      date_to: dateTo,
      ...(this.assetId ? { asset_id: this.assetId } : {})
    }
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
      amountPredicate: (node) => node.valid !== false,
      getNodeAmountResourceId: (node) => (node.id === 'root' ? null : node.id),
      loadNodeAmounts: (nodeIds, options) => this.loadStorageAmounts(nodeIds, options),
      edit: {
        drag: {
          isMove: false
        }
      },
      callback: {
        beforeRefresh: () => this.invalidateStorageMetrics(),
        onSelected: (_event, treeNode) => this.handleStorageSelected(treeNode)
      }
    }
    return {
      title: this.$t('CommandStorage'),
      loading: true,
      treeMetricsQuery: initialQuery,
      treeMetricsQueryKey: this.serializeQuery(initialQuery),
      treeMetricsReady: false,
      storageMetricsCache: new Map(),
      storageMetricsPending: new Map(),
      storageMetricsRequest: null,
      storageMetricsAbortController: null,
      storageMetricsGeneration: 0,
      storageRootMetricReady: false,
      selectedStorageNode: null,
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
        extraQuery: initialQuery,
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
  activated() {
    const storageTree = this.getStorageTreeInfo()
    if (storageTree.loaded) {
      this.ensureRootMetric(storageTree.ids, this.storageMetricsGeneration)
    }
  },
  deactivated() {
    this.pauseStorageMetrics()
  },
  beforeUnmount() {
    this.pauseStorageMetrics()
  },
  methods: {
    handleStorageSelected(treeNode) {
      if (treeNode.id === 'root') {
        this.treeTable?.selectNode(this.selectedStorageNode)
        return
      }
      if (!treeNode.valid) {
        this.$message.error(this.$tc('EsDisabled'))
        this.treeTable?.selectNode(this.selectedStorageNode)
        return
      }
      this.selectedStorageNode = treeNode
      const url = `/api/v1/terminal/commands/?command_storage_id=${treeNode.id}&order=-timestamp`
      this.tableConfig.url = url
      this.treeTable.handleUrlChange(url)
    },
    checkFirstNode(obj) {
      const nodes = obj.getNodes()
      const firstChild = nodes[0]?.children?.find((node) => node.valid !== false)
      if (firstChild) {
        obj.selectNode(firstChild)
        this.handleStorageSelected(firstChild)
      } else if (nodes[0]?.id === 'root') {
        this.storageRootMetricReady = true
        this.treeTable?.setNodeMetric('root', 0)
      }
      this.loading = false
    },
    async loadStorageAmounts(nodeIds, { signal } = {}) {
      if (!this.treeMetricsReady) {
        return { results: [] }
      }
      const storageTree = this.getStorageTreeInfo()
      if (!storageTree.loaded) {
        return this.requestStorageMetrics(nodeIds, signal)
      }

      const generation = this.storageMetricsGeneration
      await this.requestAndCacheStorageMetrics(nodeIds, signal, generation)
      const results = nodeIds
        .map((id) => ({ id: String(id), count: this.storageMetricsCache.get(String(id)) }))
        .filter((item) => Number.isFinite(item.count))
      this.ensureRootMetric(storageTree.ids, generation)
      return { results }
    },
    requestStorageMetrics(nodeIds, signal) {
      if (!nodeIds.length) {
        return Promise.resolve({ results: [] })
      }
      return this.$axios.post(
        '/api/v1/terminal/command-storages/tree-metrics/',
        { node_ids: nodeIds },
        {
          params: this.treeMetricsQuery,
          signal
        }
      )
    },
    getStorageTreeInfo() {
      const roots = this.treeTable?.getAllNodes?.() || []
      const stack = [...roots]
      const ids = []
      let loaded = false
      while (stack.length) {
        const node = stack.pop()
        if (node.id === 'root') {
          loaded = true
        } else if (node.valid !== false) {
          ids.push(String(node.id))
        }
        stack.push(...(node.children || []))
      }
      return { ids: [...new Set(ids)], loaded }
    },
    createStorageMetricsAbortError() {
      const error = new Error('Storage metrics request was superseded')
      error.name = 'AbortError'
      return error
    },
    assertStorageMetricsRequestCurrent(signal, generation) {
      if (signal?.aborted || generation !== this.storageMetricsGeneration) {
        throw this.createStorageMetricsAbortError()
      }
    },
    cacheStorageMetrics(response, signal, generation) {
      this.assertStorageMetricsRequestCurrent(signal, generation)
      for (const item of response?.results || []) {
        const count = Number(item.count)
        if (Number.isFinite(count)) {
          this.storageMetricsCache.set(String(item.id), count)
        }
      }
    },
    async requestAndCacheStorageMetrics(storageIds, signal, generation) {
      const ids = [...new Set(storageIds.map(String))]
      const waitFor = new Set()
      const requestIds = ids.filter((id) => {
        if (this.storageMetricsCache.has(id)) {
          return false
        }
        const pending = this.storageMetricsPending.get(id)
        if (pending) {
          waitFor.add(pending)
          return false
        }
        return true
      })

      if (requestIds.length) {
        const request = this.requestStorageMetrics(requestIds, signal)
          .then((response) => this.cacheStorageMetrics(response, signal, generation))
          .finally(() => {
            requestIds.forEach((id) => {
              if (this.storageMetricsPending.get(id) === request) {
                this.storageMetricsPending.delete(id)
              }
            })
          })
        requestIds.forEach((id) => this.storageMetricsPending.set(id, request))
        waitFor.add(request)
      }

      await Promise.all(waitFor)
      this.assertStorageMetricsRequestCurrent(signal, generation)
    },
    ensureRootMetric(storageIds, generation) {
      if (
        !this.treeMetricsReady ||
        this.storageRootMetricReady ||
        this.storageMetricsRequest ||
        generation !== this.storageMetricsGeneration
      ) {
        return
      }
      if (!storageIds.length) {
        this.storageRootMetricReady = true
        this.treeTable?.setNodeMetric('root', 0)
        return
      }

      const controller = new AbortController()
      this.storageMetricsAbortController = controller
      const request = (async () => {
        const batchSize = 200
        for (let index = 0; index < storageIds.length; index += batchSize) {
          const batch = storageIds
            .slice(index, index + batchSize)
            .filter((id) => !this.storageMetricsCache.has(id))
          if (batch.length) {
            await this.requestAndCacheStorageMetrics(batch, controller.signal, generation)
          }
        }
        this.assertStorageMetricsRequestCurrent(controller.signal, generation)
        if (!storageIds.every((id) => this.storageMetricsCache.has(id))) {
          return
        }
        const rootCount = storageIds.reduce(
          (total, id) => total + this.storageMetricsCache.get(id),
          0
        )
        this.storageRootMetricReady = true
        this.treeTable?.setNodeMetric('root', rootCount)
      })()
      this.storageMetricsRequest = request
      request
        .catch((error) => {
          if (error?.name !== 'AbortError' && error?.code !== 'ERR_CANCELED') {
            this.$log?.warn?.('Load command storage root metric failed', error)
          }
        })
        .finally(() => {
          if (this.storageMetricsRequest === request) {
            this.storageMetricsRequest = null
            this.storageMetricsAbortController = null
          }
        })
    },
    reloadTreeMetrics() {
      return this.treeTable?.reloadVisibleMetrics({
        fresh: true,
        resetNormal: true
      })
    },
    serializeQuery(query) {
      return JSON.stringify(
        Object.keys(query || {})
          .sort()
          .reduce((result, key) => {
            result[key] = query[key]
            return result
          }, {})
      )
    },
    invalidateStorageMetrics() {
      this.pauseStorageMetrics()
      this.storageMetricsCache = new Map()
      this.storageRootMetricReady = false
      this.treeTable?.setNodeMetric('root', null)
    },
    pauseStorageMetrics() {
      this.storageMetricsAbortController?.abort()
      this.storageMetricsGeneration += 1
      this.storageMetricsPending = new Map()
      this.storageMetricsRequest = null
      this.storageMetricsAbortController = null
    },
    handleQueryChange(query) {
      const key = this.serializeQuery(query)
      const initializing = !this.treeMetricsReady
      this.treeMetricsReady = true
      if (!initializing && key === this.treeMetricsQueryKey) {
        return
      }
      this.treeMetricsQuery = { ...query }
      this.treeMetricsQueryKey = key
      this.invalidateStorageMetrics()
      const reload = this.reloadTreeMetrics()
      const storageTree = this.getStorageTreeInfo()
      if (storageTree.loaded && !storageTree.ids.length) {
        this.storageRootMetricReady = true
        this.treeTable?.setNodeMetric('root', 0)
      }
      return reload
    }
  }
}
</script>

<style lang="scss" scoped>
.command-list-table {
  --tree-table-header-height: 39px;
}

.command-list-table :deep(.risk-command) {
  background-color: oldlace;

  tr {
    color: white;
  }
}
</style>
