<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script type="text/jsx">
import ListTable from '@/components/ListTable'
import { DetailFormatter } from '@/components/TableFormatters'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'TaskHistory',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/ops/adhoc-executions/?task=${this.object.id}`,
        columns: [
          'date_start', 'stat', 'ratio', 'is_finished', 'is_success', 'timedelta', 'adhoc_short_id', 'actions'
        ],
        columnsMeta: {
          date_start: {
            formatter: (row) => toSafeLocalDateStr(row.date_start),
            width: '160px'
          },
          stat: {
            label: this.$t('ops.stat'),
            align: 'center',
            width: '100px',
            formatter: function(row) {
              return (
                <div>
                  <span class='text-primary'>{row.stat.success}</span>/
                  <span class='text-danger'>{row.stat.failed}</span>/
                  <span>{row.stat.total}</span>
                </div>
              )
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
            label: this.$t('ops.version'),
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'HistoryExecutionDetail'
            }
          },
          actions: {
            prop: 'id',
            formatterArgs: {
              hasEdit: false,
              hasDelete: false,
              hasUpdate: false,
              hasClone: false,
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
