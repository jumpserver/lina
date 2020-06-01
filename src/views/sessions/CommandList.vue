<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { formatDate, toSafeLocalDateStr } from '@/utils/common'
import { OutputExpandFormatter } from './formatters'
import { DetailFormatter } from '@/components/ListTable/formatters'

export default {
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        hasSelection: false,
        url: '/api/v1/terminal/commands/',
        columns: [
          'expandCol', 'input', 'risk_level', 'user',
          'asset', 'system_user', 'session', 'timestamp'
        ],
        extraQuery: {
          date_to: formatDate(new Date().getTime()),
          date_from: formatDate((new Date().getTime()) - 432000000)
        },
        columnsMeta: {
          expandCol: {
            type: 'expand',
            prop: 'output',
            formatter: OutputExpandFormatter
          },
          input: {
            label: this.$t('sessions.command')
          },
          risk_level: {
            label: this.$t('sessions.riskLevel')
          },
          user: {
            label: this.$t('sessions.user')
          },
          asset: {
            label: this.$t('sessions.asset')
          },
          system_user: {
            label: this.$t('sessions.systemUser')
          },
          session: {
            label: this.$t('sessions.session'),
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'SessionDetail',
              getTitle() {
                return vm.$t('sessions.goto')
              }
            }
          },
          timestamp: {
            label: this.$t('sessions.date'),
            formatter: function(row) {
              return toSafeLocalDateStr(row.timestamp * 1000)
            }
          }
        },
        tableActions: {
          hasEdit: false,
          hasDelete: false
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasExport: false,
        hasDatePicker: true
      }
    }
  }
}
</script>

<style>

</style>
