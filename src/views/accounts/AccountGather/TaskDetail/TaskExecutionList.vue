<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'

export default {
  name: 'AccountGatherTaskExecutionList',
  components: {
    GenericListTable
  },
  props: {
    object: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/accounts/gather-account-executions/?' + `${this.object.id ? 'automation_id=' + this.object.id : ''}`,
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
      },
      headerActions: {
        hasSearch: true,
        hasRefresh: true,
        hasRightActions: true,
        hasLeftActions: true,
        hasMoreActions: false,
        hasExport: false,
        hasImport: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false
      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
