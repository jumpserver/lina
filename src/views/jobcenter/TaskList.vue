<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { timeOffset, toSafeLocalDateStr } from '@/utils/common'
import { GenericListPage } from '@/layout/components'
import { ActionsFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/ops/tasks/',
        columns: ['name', 'runtimes', 'host_amount', 'is_success', 'date_start', 'time', 'actions'],
        columnsMeta: {
          name: {
            label: this.$tc('Name')
          },
          runtimes: {
            label: this.$t('jobcenter.RunTimes'),
            formatter: function(row) {
              const successTime = row.summary.success
              const failedTime = row.summary.failed
              const total = row.summary.total
              return (successTime + '/' + failedTime + '/' + total)
            }
          },
          host_amount: {
            label: this.$t('jobcenter.Hosts'),
            formatter: function(row) {
              return row.latest_execution.hosts_amount
            }
          },
          is_success: {
            label: this.$t('jobcenter.Success'),
            formatter: function(row) {
              return row.latest_execution.is_success
            }
          },
          date_start: {
            label: this.$t('jobcenter.Date'),
            formatter: function(row) {
              return toSafeLocalDateStr(row.latest_execution.date_start)
            }
          },
          time: {
            label: this.$t('jobcenter.Time'),
            formatter: function(row) {
              return timeOffset(row.latest_execution.date_start, row.latest_execution.date_finished)
            }
          },
          actions: {
            prop: 'id',
            label: this.$tc('Action'),
            formatter: ActionsFormatter,
            actions: {
              hasUpdate: false,
              extraActions: [
                {
                  name: 'run',
                  title: this.$t('jobcenter.run'),
                  type: 'primary',
                  callback: function({ cellValue, tableData }) {
                    // 跳转页面
                    const replayUrl = '/ops/celery/task/' + cellValue
                    window.open(replayUrl)
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
