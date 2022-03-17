<template>
  <GenericListTable ref="GenericListTable" :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable/index'

export default {
  name: 'TaskExecutionList',
  components: { GenericListTable },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      headerActions: {
        hasLeftActions: false,
        hasBulkDelete: false,
        hasImport: false,
        hasExport: false,
        hasSearch: false
      },
      tableConfig: {
        url: `/api/v1/xpack/gathered-user/task-executions/?task=${this.object.id}`,
        columns: ['timedelta', 'date_start', 'success'],
        columnsMeta: {
          timedelta: {
            label: this.$t('ops.timeDelta'),
            formatter: function(row) {
              return row.timedelta.toFixed(2) + 's'
            },
            width: null
          },
          date_start: {
            width: null
          },
          success: {
            width: null,
            label: this.$t('common.Success')
          }
        }

      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
