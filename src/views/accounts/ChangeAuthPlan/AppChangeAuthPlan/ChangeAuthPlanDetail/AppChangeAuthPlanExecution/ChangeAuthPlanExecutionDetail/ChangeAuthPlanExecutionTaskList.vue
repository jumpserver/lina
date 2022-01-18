<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'

export default {
  name: 'AppChangeAuthPlanExecutionTaskList',
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
        url: `/api/v1/xpack/change-auth-plan/app-plan-execution-subtask/?plan_execution_id=${this.object.id}`,
        columns: [
          'app_display', 'system_user_display', 'is_success', 'timedelta', 'date_start', 'reason_display', 'actions'
        ],
        columnsMeta: {
          app_display: {
            label: this.$t('xpack.ChangeAuthPlan.Database'),
            formatter: function(row, column, cellValue, index) {
              const to = {
                name: 'DatabaseAppDetail',
                params: { id: row.app }
              }
              return <router-link to={ to } >{ row.app_display }</router-link>
            }
          },
          reason_display: {
            label: this.$t('xpack.AccountBackupPlan.Reason')
          },
          system_user_display: {
            label: this.$t('xpack.ChangeAuthPlan.SystemUser')
          },
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
                      `/api/v1/xpack/change-auth-plan/app-plan-execution-subtask/${row.id}/`,
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
