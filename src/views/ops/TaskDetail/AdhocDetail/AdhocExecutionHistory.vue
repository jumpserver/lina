<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
import { ActionsFormatter } from '@/components/TableFormatters'
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
            label: this.$t('ops.stat'),
            align: 'center',
            width: '100px',
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
            label: this.$t('ops.ratio'),
            align: 'center',
            width: '80px',
            formatter: function(row) {
              const ratio = (row.stat.success / row.stat.total) * 100
              if (ratio === 100) {
                return <span class='text-navy'>{ratio + '%'}</span>
              }
              return <span class='text-danger'>{ratio + '%'}</span>
            }
          },
          is_finished: {
            align: 'center',
            width: '100px',
            label: this.$t('ops.isFinished')
          },
          is_success: {
            align: 'center',
            width: '100px',
            label: this.$t('ops.isSuccess')
          },
          timedelta: {
            label: this.$t('ops.time'),
            width: '100px',
            formatter: function(row) {
              return row.timedelta.toFixed(2) + 's'
            }
          },
          adhoc_short_id: {
            label: this.$t('ops.version')
          },
          actions: {
            prop: 'id',
            formatter: ActionsFormatter,
            formatterArgs: {
              hasEdit: false,
              hasDelete: false,
              hasClone: false,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'detail',
                  title: this.$t('ops.detail'),
                  type: 'primary',
                  callback: function({ row, tableData }) {
                    return this.$router.push({ name: 'HistoryExecutionDetail', params: { id: row.id }})
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasRightActions: false
      }
    }
  }
}
</script>

<style scoped>

</style>
