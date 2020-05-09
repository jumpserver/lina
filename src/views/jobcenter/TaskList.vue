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
            label: this.$tc('Name'),
            showOverflowTooltip: true
          },
          runtimes: {
            label: this.$t('jobcenter.RunTimes'),
            formatter: function(row) {
              const summary = <div>
                <span class='text-primary'>{row.summary.success}</span>/
                <span class='text-danger'>{row.summary.failed}</span>/
                <span>{row.summary.total}</span>
              </div>
              return summary
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
            formatter: row => {
              if (row.latest_execution.is_success) {
                return <i class='fa fa-check text-primary'/>
              }
              return <i class='fa fa-times text-danger'/>
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
                    const newPage = this.$router.resolve({
                      name: 'CeleryTaskLog',
                      query: {
                        id: 12345678
                      }
                    })
                    window.open(newPage.href, '_blank', 'toolbar=yes, width=900, height=600')
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasExport: false,
        hasImport: false,
        hasRefresh: false

      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
