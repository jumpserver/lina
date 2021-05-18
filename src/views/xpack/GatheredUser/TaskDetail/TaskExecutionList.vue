<template>
  <GenericListTable ref="GenericListTable" :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable/index'
import { BooleanFormatter, DateFormatter } from '@/components/TableFormatters'

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
        hasSearch: true
      },
      tableConfig: {
        url: `/api/v1/xpack/gathered-user/task-executions/?task=${this.object.id}`,
        columns: [
          {
            prop: 'timedelta',
            label: this.$t('ops.timeDelta'),
            formatter: function(row) {
              return row.timedelta.toFixed(2) + 's'
            }
          },
          {
            prop: 'date_start',
            label: this.$t('common.DateStart'),
            formatter: DateFormatter
          },
          {
            prop: 'success',
            label: this.$t('common.Success'),
            width: '90px',
            align: 'center',
            formatter: BooleanFormatter,
            formatterArgs: {
              iconChoices: {
                false: 'fa-times text-danger',
                true: 'fa-check text-primary'
              }
            }
          }
        ]
      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
