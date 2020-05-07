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
            label: this.$t('jobcenter.Stat'),
            formatter: function(row) {
              return '请求的api里没有该数据'
            }
          },
          ratio: {
            label: this.$t('jobcenter.Ratio'),
            formatter: function(row) {
              return '请求的api里没有该数据'
            }
          },
          is_finished: {
            label: this.$t('jobcenter.IsFinished')
          },
          is_success: {
            label: this.$t('jobcenter.IsSuccess')
          },
          timedelta: {
            label: this.$t('jobcenter.Time'),
            formatter: function(row) {
              return row.timedelta.toFixed(2) + 's'
            }
          },
          adhoc_short_id: {
            label: this.$t('jobcenter.Version')
          },
          actions: {
            prop: 'id',
            abel: this.$tc('Action'),
            formatter: ActionsFormatter,
            actions: {
              hasEdit: false,
              hasDelete: false,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'detail',
                  title: '详情',
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
