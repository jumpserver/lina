<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { getDaysAgo, toSafeLocalDateStr } from '@/utils/common'
import { OutputExpandFormatter } from './formatters'
import { DetailFormatter } from '@/components/ListTable/formatters'

export default {
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    const now = new Date()
    const dateFrom = getDaysAgo(2, now).toISOString()
    const dateTo = now.toISOString()
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
