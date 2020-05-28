<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'

export default {
  name: 'ChangeAuthPlanExecution',
  components: {
    ListTable
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
        url: `/api/v1/xpack/change-auth-plan/plan-execution/?plan_id=${this.object.id}`,
        columns: [
          'username', 'assets_amount', 'nodes_amount', 'result_summary', 'password_strategy_display',
          'timedelta', 'date_start', 'actions'
        ],
        columnsMeta: {
          username: {
            label: this.$t('xpack.ChangeAuthPlan.Username')
          },
          assets_amount: {
            label: this.$t('xpack.Asset')
          },
          nodes_amount: {
            label: this.$t('xpack.Node')
          },
          result_summary: {
            label: this.$t('xpack.ChangeAuthPlan.Result'),
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
            label: this.$t('xpack.ChangeAuthPlan.PasswordStrategy')
          },
          timedelta: {
            label: this.$t('xpack.ChangeAuthPlan.TimeDelta'),
            formatter: function(row) {
              return row.timedelta.toFixed(2) + 's'
            }
          },
          date_start: {
            showOverflowTooltip: true
          },
          actions: {
            prop: 'id',
            formatterArgs: {
              hasDelete: false,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'log',
                  type: 'primary',
                  title: this.$t('xpack.ChangeAuthPlan.Log'),
                  callback: function({ cellValue, tableData }) {
                    window.open(`/ops/celery/task/${cellValue}/log/`, '_blank', 'toolbar=yes, width=900, height=600')
                  }
                },
                {
                  name: 'detail',
                  title: this.$t('xpack.ChangeAuthPlan.Detail'),
                  type: 'info',
                  callback: function({ cellValue, tableData }) {
                    return this.$router.push({ name: 'ChangeAuthPlanExecutionDetail', params: { id: cellValue }})
                  }
                }
              ]
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
