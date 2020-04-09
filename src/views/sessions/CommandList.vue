<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { toSafeLocalDateStr } from '@/utils/common'
import OutputExpandFormatter from '@/components/ListTable/formatters/OutputExpandFormatter'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        hasSelection: false,
        url: '/api/v1/terminal/commands/',
        columns: [
          'expandCol', 'input', 'risk_level', 'user',
          'asset', 'system_user', 'session', 'timestamp'
        ],
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
            label: this.$t('sessions.RiskLevel')
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
            label: this.$t('sessions.session')
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
        hasCreate: false,
        hasBulkDelete: false
      }
    }
  }
}
</script>

<style>

</style>
