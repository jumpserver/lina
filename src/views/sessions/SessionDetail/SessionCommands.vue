<template>
  <ListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import ListTable from '@/components/Table/ListTable'
import { OutputExpandFormatter } from '../formatters'
import { toSafeLocalDateStr } from '@/utils/common/time'

export default {
  name: 'SessionCommands',
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        hasSelection: false,
        url: `/api/v1/terminal/commands/?session_id=${this.$route.params.id}`,
        columns: [
          'expandCol', 'index', 'input', 'timestamp'
        ],
        columnsMeta: {
          expandCol: {
            type: 'expand',
            formatter: OutputExpandFormatter
          },
          index: {
            type: 'index',
            label: 'ID',
            sortable: 'custom'
          },
          input: {
            label: this.$t('Command'),
            sortable: 'custom'
          },
          timestamp: {
            width: '160px',
            sortable: 'custom',
            formatter: function(row) {
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
  },
  async mounted() {
    const drawActionMeta = await this.$store.dispatch('common/getDrawerActionMeta')

    if (drawActionMeta && drawActionMeta.id) {
      this.tableConfig.url = `/api/v1/terminal/commands/?session_id=${drawActionMeta.id}`
    }
  }
}
</script>
