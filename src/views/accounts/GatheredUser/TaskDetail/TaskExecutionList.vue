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
        url: `/api/v1/assets/'gather-account-executions/?automation_id=${this.object.id}`,
        columns: ['trigger_display', 'date_start', 'date_finished', 'status'],
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
          }
        }

      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
