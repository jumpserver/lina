<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'

export default {
  name: 'DatabaseChangeAuthPlanExecutionList',
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
        url: `/api/v1/xpack/change-auth-plan/database-plan-execution/?plan_id=${this.object.id}`,
        columns: [
          'database_name', 'database_id', 'systemusers', 'systemuser_ids', 'result_summary',
          'password_strategy_display', 'timedelta', 'trigger_display', 'date_start', 'actions'
        ],
        columnsShow: {
          min: ['database_name', 'actions'],
          default: [
            'database_name', 'systemusers', 'result_summary', 'password_strategy_display',
            'timedelta', 'trigger_display', 'date_start', 'actions'
          ]
        },
        columnsMeta: {
          database_name: {
            label: this.$t('xpack.ChangeAuthPlan.Database')
          },
          database_id: {
            label: this.$t('xpack.ChangeAuthPlan.DatabaseId')
          },
          systemusers: {
            label: this.$t('xpack.ChangeAuthPlan.SystemUser')
          },
          systemuser_ids: {
            label: this.$t('xpack.ChangeAuthPlan.SystemUserId')
          },
          result_summary: {
            label: this.$t('xpack.ChangeAuthPlan.Result'),
            width: '80px',
            showOverflowTooltip: true,
            formatter: function(row) {
              const summary = <div>
                <span class='text-primary'>{row.result_summary.succeed}</span>/
                <span class='text-danger'>{row.result_summary.failed}</span>/
                <span>{row.result_summary.total}</span>
              </div>
              return summary
            }
          },
          password_strategy_display: {
            label: this.$t('xpack.ChangeAuthPlan.PasswordStrategy'),
            width: '220px',
            showOverflowTooltip: true
          },
          timedelta: {
            label: this.$t('xpack.ChangeAuthPlan.TimeDelta'),
            width: '90px',
            formatter: function(row) {
              return row.timedelta.toFixed(2) + 's'
            }
          },
          date_start: {
            showOverflowTooltip: true
          },
          actions: {
            formatterArgs: {
              hasDelete: false,
              hasUpdate: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'log',
                  type: 'primary',
                  title: this.$t('xpack.ChangeAuthPlan.Log'),
                  callback: function({ row }) {
                    window.open(`/#/ops/celery/task/${row.id}/log/`, '_blank', 'toolbar=yes, width=900, height=600')
                  }
                },
                {
                  name: 'detail',
                  title: this.$t('xpack.ChangeAuthPlan.Detail'),
                  type: 'info',
                  callback: function({ row }) {
                    return this.$router.push({ name: 'DatabaseChangeAuthPlanExecutionDetail', params: { id: row.id }})
                  }
                }
              ]
            }
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

<style scoped>

</style>
