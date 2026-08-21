<template>
  <ListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import ListTable from '@/components/Table/ListTable'
import { OutputExpandFormatter } from '../formatters'
import { toSafeLocalDateStr } from '@/composables/useDateTime'

export default {
  name: 'SessionCommands',
  components: {
    ListTable
  },
  data() {
    const sessionId = this.$context.get('id')
    return {
      tableConfig: {
        hasSelection: false,
        url: `/api/v1/terminal/commands/?session_id=${sessionId}`,
        columns: ['expandCol', 'index', 'input', 'timestamp'],
        columnsShow: {
          min: ['expandCol', 'index'],
          default: ['expandCol', 'index', 'input', 'timestamp']
        },
        columnsMeta: {
          expandCol: {
            type: 'expand',
            formatter: OutputExpandFormatter
          },
          index: {
            type: 'index',
            label: this.$t('RowNumber')
          },
          input: {
            label: this.$t('Command'),
            sortable: 'custom'
          },
          timestamp: {
            width: '160px',
            sortable: 'custom',
            formatter: function (row) {
              return toSafeLocalDateStr(row.timestamp * 1000)
            }
          },
          actions: {
            has: false
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
