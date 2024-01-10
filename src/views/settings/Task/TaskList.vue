<template>
  <ListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script type="text/jsx">
import { ChoicesFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import { BASE_URL } from '@/utils/common'
import ListTable from '@/components/Table/ListTable/index.vue'

export default {
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/ops/tasks/',
        columns: [
          'name', 'queue', 'count', 'state', 'date_last_publish', 'exec_cycle', 'next_exec_time'
        ],
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              can: this.$hasPerm('ops.view_celerytask'),
              router: 'TaskDetail',
              getTitle({ row, cellValue }) {
                if (row.meta && row.meta.comment) {
                  return row.meta.comment
                }
                return cellValue
              }
            }
          },
          actions: {
            has: false
          },
          queue: {
            width: '120px',
            label: this.$t('Queue'),
            formatter: (row) => {
              return row.meta.queue
            }
          },
          comment: {
            width: '300px',
            label: this.$t('Comment'),
            formatter: row => {
              return row.meta.comment ? row.meta.comment : '-'
            }
          },
          last_published_time: {
            label: this.$t('LastPublishedTime'),
            width: '210px',
            formatter: (row) => {
              return row.last_published_time != null ? row.last_published_time : '-'
            }
          },
          exec_cycle: {
            label: this.$t('ExecuteCycle'),
            width: '120px',
            formatter: (row) => {
              return row.exec_cycle ? row.exec_cycle : '-'
            }
          },
          next_exec_time: {
            label: this.$t('ExpectedNextExecuteTime'),
            width: '210px',
            formatter: (row) => {
              return row.next_exec_time ? row.next_exec_time : '-'
            }
          },
          count: {
            width: '80px',
            label: `${this.$t('Success')}/${this.$t('Total')}`,
            formatter: (row) => {
              return <div>
                <span Class='text-primary'>{row.summary.success}</span>/
                <span>{row.summary.total}</span>
              </div>
            }
          },
          state: {
            label: this.$t('State'),
            width: '60px',
            align: 'center',
            formatter: ChoicesFormatter,
            formatterArgs: {
              getIcon() {
                return 'fa-circle-o'
              },
              classChoices: {
                green: 'text-primary',
                yellow: 'text-warning',
                red: 'text-danger'
              },
              showText: false,
              hasTips: true,
              getTips: ({ cellValue }) => {
                switch (cellValue) {
                  case 'green':
                    return this.$t('StatusGreen')
                  case 'yellow':
                    return this.$t('StatusYellow')
                  default:
                    return this.$t('StatusRed')
                }
              }
            }
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasMoreActions: false,
        extraActions: [
          {
            title: this.$t('TaskMonitor'),
            type: 'primary',
            callback: () => {
              window.open(`${BASE_URL}/core/flower/?_=${Date.now()}`,)
            }
          }
        ]
      }
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
