<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'

export default {
  name: 'ChangeAuthPlanExecutionTaskList',
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
        url: `/api/v1/xpack/change-auth-plan/plan-execution-subtask/?plan_execution_id=${this.object.id}`,
        columns: [
          'username', 'asset', 'is_success', 'reason', 'timedelta', 'date_start', 'actions'
        ],
        columnsMeta: {
          asset: {
            label: this.$t('xpack.Asset'),
            formatter: function(row, column, cellValue, index) {
              const url = `/assets/assets/${cellValue}`
              return <router-link to={ url } >{ row.asset_info.hostname }</router-link>
            }
          },
          is_success: {
            label: this.$t('xpack.Success')
          },
          timedelta: {
            label: this.$t('xpack.ChangeAuthPlan.TimeDelta'),
            formatter: function(row) {
              return row.timedelta.toFixed(2) + 's'
            }
          },
          actions: {
            prop: 'id',
            formatterArgs: {
              hasDelete: false,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'retry',
                  type: 'info',
                  title: this.$t('xpack.ChangeAuthPlan.Retry'),
                  callback: function({ cellValue, tableData }) {
                    this.$axios.put(
                      `/api/v1/xpack/change-auth-plan/plan-execution-subtask/${cellValue}/`,
                    ).then(res => {
                      window.open(`/ops/celery/task/${res.task}/log/`, '_blank', 'toolbar=yes, width=900, height=600')
                    })
                  }.bind(this)
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
