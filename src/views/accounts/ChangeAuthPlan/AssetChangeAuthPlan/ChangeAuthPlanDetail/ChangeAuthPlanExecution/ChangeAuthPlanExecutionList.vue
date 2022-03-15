<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'

export default {
  name: 'ChangeAuthPlanExecution',
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
        url: `/api/v1/xpack/change-auth-plan/plan-execution/?plan_id=${this.object.id}`,
        columns: [
          'username', 'assets_amount', 'nodes_amount', 'result_summary', 'password_strategy_display',
          'timedelta', 'trigger_display', 'date_start', 'actions'
        ],
        columnsMeta: {
          username: {
            label: this.$t('xpack.ChangeAuthPlan.Username')
          },
          assets_amount: {
            label: this.$t('xpack.ChangeAuthPlan.AssetAmount'),
            width: '80px'
          },
          nodes_amount: {
            label: this.$t('xpack.ChangeAuthPlan.NodeAmount'),
            width: '80px'
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
                  can: 'xpack.view_changeauthplanexecution',
                  title: this.$t('xpack.ChangeAuthPlan.Log'),
                  callback: function({ row }) {
                    window.open(`/#/ops/celery/task/${row.id}/log/`, '_blank', 'toolbar=yes, width=900, height=600')
                  }
                },
                {
                  name: 'detail',
                  title: this.$t('xpack.ChangeAuthPlan.Detail'),
                  type: 'info',
                  can: this.$hasPerm('xpack.view_changeauthplantask'),
                  callback: function({ row }) {
                    return this.$router.push({ name: 'ChangeAuthPlanExecutionDetail', params: { id: row.id }})
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
