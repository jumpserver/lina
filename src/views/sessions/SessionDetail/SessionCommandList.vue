<template>
  <el-row :gutter="20">
    <el-col :span="16">
      <ListTable :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import { OutputExpandFormatter } from '../formatters'
import { toSafeLocalDateStr } from '@/utils/common'
export default {
  name: 'SessionCommandList',
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        hasSelection: false,
        url: `/api/v1/terminal/commands/?session=${this.$route.params.id}`,
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
            label: this.$t('sessions.command'),
            sortable: 'custom'
          },
          timestamp: {
            label: this.$t('sessions.date'),
            sortable: 'custom',
            formatter: function(row) {
              return toSafeLocalDateStr(row.timestamp * 1000)
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
