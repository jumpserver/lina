<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { getDaysAgo } from '@/utils/common'
import { DetailFormatter, DisplayFormatter } from '@/components/ListTable/formatters'

export default {
  components: {
    GenericListPage
  },
  data() {
    const now = new Date()
    const dateFrom = getDaysAgo(7, now).toISOString()
    const dateTo = now.toISOString()
    return {
      tableConfig: {
        url: '/api/v1/audits/command-execution-logs/',
        columns: [
          'hosts', 'user', 'command', 'run_as', 'result', 'is_finished',
          'is_success', 'date_start'
        ],
        columnsMeta: {
          hosts: {
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ cellValue }) => {
                return cellValue.length
              }
            }
          },
          user: {
            formatter: DisplayFormatter
          },
          run_as: {
            formatter: DisplayFormatter
          },
          is_finished: {
            width: '100px'
          },
          is_success: {
            width: '100px'
          },
          result: {
            width: '80px',
            formatter: (row) => {
              const label = this.$t('audits.View')
              return <el-link Type='success'>{ label }</el-link>
            }
          },
          date_start: {
            width: '160px'
          }
        },
        extraQuery: {
          date_to: dateTo,
          date_from: dateFrom
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasDatePicker: true,
        hasImport: false,
        datePicker: {
          dateStart: dateFrom,
          dateEnd: dateTo
        }
      }
    }
  }
}
</script>

<style>

</style>
