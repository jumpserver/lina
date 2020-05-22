<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
import { ActionsFormatter } from '@/components/ListTable/formatters/index'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'AdhocExecutionHistory',
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/ops/adhoc-executions/?adhoc=${this.$route.params.id}`,
        columns: [
          'date_start', 'stat', 'ratio', 'is_finished', 'is_success', 'timedelta', 'adhoc_short_id', 'actions'
        ],
        columnsMeta: {
          date_start: {
            formatter: function(row) {
              return toSafeLocalDateStr(row.date_start)
            }
          },
          stat: {
            label: this.$t('jobcenter.stat'),
            formatter: function(row) {
              const summary = <div>
                <span class='text-primary'>{row.stat.success}</span>/
                <span class='text-danger'>{row.stat.failed}</span>/
                <span>{row.stat.total}</span>
              </div>
              return summary
            }
          },
          ratio: {
            label: this.$t('jobcenter.ratio'),
            formatter: function(row) {
              const ratio = (row.stat.success / row.stat.total) * 100
              if (ratio === 100) {
                return <span class='text-navy'>{ratio + '%'}</span>
              }
              return <span class='text-danger'>{ratio + '%'}</span>
            }
          },
          is_finished: {
            label: this.$t('jobcenter.isFinished')
          },
          is_success: {
            label: this.$t('jobcenter.isSuccess')
          },
          timedelta: {
            label: this.$t('jobcenter.time'),
            formatter: function(row) {
              return row.timedelta.toFixed(2) + 's'
            }
          },
          adhoc_short_id: {
            label: this.$t('jobcenter.version')
          },
          actions: {
            prop: 'id',
            formatter: ActionsFormatter,
            actions: {
              hasEdit: false,
              hasDelete: false,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'detail',
                  title: this.$t('jobcenter.detail'),
                  type: 'primary',
                  callback: function({ cellValue, tableData }) {
                    return this.$router.push({ name: 'HistoryExecutionDetail', params: { id: cellValue }})
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: false,
        hasSearch: false,
        hasRightActions: false
      }
    }
  }
}
</script>

<style scoped>

</style>
