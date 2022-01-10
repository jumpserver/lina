<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'

export default {
  name: 'EscapeRoutePlanExecutionTaskList',
  components: {
    GenericListTable
  },
  props: {
    object: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/xpack/assets/escape-execution-subtask/?plan_execution_id=${this.object.id}`,
        columns: [
          'is_success', 'reason', 'timedelta', 'date_start', 'actions'
        ],
        columnsMeta: {
          is_success: {
            label: this.$t('xpack.ChangeAuthPlan.Success')
          },
          timedelta: {
            label: this.$t('xpack.ChangeAuthPlan.TimeDelta'),
            width: '90px',
            formatter: function(row) {
              return row.timedelta.toFixed(2) + 's'
            }
          },
          actions: {
            formatterArgs: {
              hasDelete: false,
              hasUpdate: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'retry',
                  type: 'info',
                  title: this.$t('xpack.ChangeAuthPlan.Retry'),
                  callback: function({ row, tableData }) {
                    this.$axios.put(
                      `/api/v1/assets/escape-execution-subtask/${row.id}/`,
                    ).then(res => {
                      window.open(`/#/ops/celery/task/${res.task}/log/`, '_blank', 'toolbar=yes, width=900, height=600')
                    })
                  }.bind(this)
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasSearch: true,
        hasRefresh: true,
        hasLeftActions: true,
        hasRightActions: true,
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

<style scoped>

</style>
