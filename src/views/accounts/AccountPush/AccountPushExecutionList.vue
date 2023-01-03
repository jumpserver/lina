<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'

export default {
  name: 'AccountPushExecutionList',
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
    console.log('this', this)
    return {
      tableConfig: {
        url: '/api/v1/accounts/push-account-executions/?' + `${this.object.id ? 'automation_id=' + this.object.id : ''}`,
        columns: [
          'asset_amount', 'node_amount', 'status',
          'trigger_display', 'date_start', 'actions'
        ],
        columnsMeta: {
          asset_amount: {
            label: this.$t('xpack.ChangeAuthPlan.AssetAmount'),
            width: '80px',
            formatter: function(row) {
              return <span>{ row.snapshot.asset_amount }</span>
            }
          },
          node_amount: {
            label: this.$t('xpack.ChangeAuthPlan.NodeAmount'),
            width: '80px',
            formatter: function(row) {
              return <span>{ row.snapshot.node_amount }</span>
            }
          },
          status: {
            label: this.$t('xpack.ChangeAuthPlan.Result'),
            width: '80px'
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
                  name: 'log',
                  type: 'primary',
                  can: 'accounts.view_changesecretexecution',
                  title: this.$t('xpack.ChangeAuthPlan.Log'),
                  callback: function({ row }) {
                    window.open(`/#/ops/celery/task/${row.id}/log/`, '_blank', 'toolbar=yes, width=900, height=600')
                  }
                },
                {
                  name: 'detail',
                  title: this.$t('xpack.ChangeAuthPlan.Detail'),
                  type: 'info',
                  can: this.$hasPerm('accounts.view_changesecretexecution'),
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
