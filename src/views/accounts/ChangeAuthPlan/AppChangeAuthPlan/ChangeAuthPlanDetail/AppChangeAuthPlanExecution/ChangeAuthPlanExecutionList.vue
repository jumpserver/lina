<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'

export default {
  name: 'AppChangeAuthPlanExecutionList',
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
        url: `/api/v1/xpack/change-auth-plan/app-plan-execution/?plan_id=${this.object.id}`,
        columns: [
          'username', 'result_summary', 'password_strategy_display', 'timedelta', 'trigger_display',
          'apps_amount', 'system_users_amount', 'date_start', 'actions'
        ],
        columnsShow: {
          min: ['actions'],
          default: [
            'username', 'password_strategy_display',
            'timedelta', 'trigger_display', 'date_start', 'actions', 'result_summary'
          ]
        },
        columnsMeta: {
          username: {
            label: this.$t('xpack.ChangeAuthPlan.Username')
          },
          apps_amount: {
            label: this.$t('xpack.ChangeAuthPlan.AppAmount')
          },
          system_users_amount: {
            label: this.$t('xpack.ChangeAuthPlan.SystemUserAmount')
          },
          systemusers: {
            label: this.$t('xpack.ChangeAuthPlan.SystemUser')
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
                  can: 'xpack.view_applicationchangeauthplanexecution',
                  title: this.$t('xpack.ChangeAuthPlan.Log'),
                  callback: function({ row }) {
                    window.open(`/#/ops/celery/task/${row.id}/log/`, '_blank', 'toolbar=yes, width=900, height=600')
                  }
                },
                {
                  name: 'detail',
                  title: this.$t('xpack.ChangeAuthPlan.Detail'),
                  type: 'info',
                  can: 'xpack.view_applicationchangeauthplantask',
                  callback: function({ row }) {
                    return this.$router.push({ name: 'AppChangeAuthPlanExecutionDetail', params: { id: row.id }})
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
