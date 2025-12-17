<template>
  <ListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script lang="jsx">
import { ChoicesFormatter, DetailFormatter, SwitchFormatter } from '@/components/Table/TableFormatters'
import { BASE_URL } from '@/utils/common/index'
import { DrawerListTable as ListTable } from '@/components'

export default {
  name: 'TaskList',
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/ops/tasks/',
        columns: [
          'name', 'queue', 'count', 'state', 'date_last_publish',
          'exec_cycle', 'next_exec_time', 'enabled'
        ],
        columnsShow: {
          default: [
            'name', 'count', 'state', 'date_last_publish',
            'exec_cycle', 'next_exec_time', 'enabled'
          ]
        },
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
          queue: {
            label: this.$t('Queue'),
            width: '120px',
            formatter: (row) => {
              return row.meta.queue
            }
          },
          comment: {
            width: '300px',
            formatter: row => {
              return row.meta.comment ? row.meta.comment : '-'
            }
          },
          last_published_time: {
            width: '210px',
            formatter: (row) => {
              return row.last_published_time != null ? row.last_published_time : '-'
            }
          },
          exec_cycle: {
            width: '120px',
            formatter: (row) => {
              return row.exec_cycle ? row.exec_cycle : '-'
            }
          },
          next_exec_time: {
            width: '210px',
            formatter: (row) => {
              return row.next_exec_time ? row.next_exec_time : '-'
            }
          },
          count: {
            width: '130px',
            label: `${this.$t('Success')}/${this.$t('Total')}`,
            formatter: (row) => {
              return <div>
                <span class='text-primary'>{row.summary.success || 0}</span>/
                <span>{row.summary.total || 0}</span>
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
          },
          actions: {
            has: false
          },
          enabled: {
            width: '120px',
            label: `${this.$t('Enable')}`,
            formatter: SwitchFormatter,
            formatterArgs: {
              isDisplay(row) {
                return row.exec_cycle !== undefined
              },
              getPatchUrl(row) {
                return `/api/v1/ops/celery/period-tasks/${row.name}/`
              },
              getPatchData(row) {
                return {
                  enabled: !row.enabled
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
            can: this.$hasPerm('ops.view_taskmonitor'),
            callback: () => {
              window.open(`${BASE_URL}/core/flower/?_=${Date.now()}`,)
            }
          }
        ]
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
