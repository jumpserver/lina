<template>
  <GenericTreeListPage
    ref="GenericTreeListPage"
    :table-config="tableConfig"
    :header-actions="headerActions"
    :tree-setting="treeSetting"
    @TreeInitFinish="checkFirstNode"
  />
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage/index'
import { getDayEnd, getDaysAgo, toSafeLocalDateStr } from '@/utils/common'
import { OutputExpandFormatter } from './formatters'
import { DetailFormatter } from '@/components/ListTable/formatters'

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
      tableConfig: {
        url: '/api/v1/terminal/commands/',
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
        url: '/api/v1/assets/assets/',
        nodeUrl: '/api/v1/assets/nodes/',
        // ?assets=0不显示资产. =1显示资产
        treeUrl: '/api/v1/terminal/command-storages/tree/?real=1',
        callback: {
          onSelected: function(event, treeNode) {
            // 禁止点击根节点
            if (treeNode.id === 'root') {
              return
            }
            let combinator = '?'
            if (this.tableConfig.url.indexOf('?') !== -1) {
              combinator = '&'
            }
            this.tableConfig.url = `${this.tableConfig.url}${combinator}command_storage_id=${treeNode.id}`
          }.bind(this)
        }
      }
    }
  },
  computed: {

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
    }
  }
}
</script>

<style>

</style>
