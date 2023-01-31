<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'

export default {
  name: 'AccountChangeSecretExecutionList',
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
        url: '/api/v1/accounts/change-secret-executions',
        columns: [
          'asset_amount', 'node_amount', 'status',
          'trigger', 'date_start', 'actions'
        ],
        columnsMeta: {
          asset_amount: {
            label: this.$t('accounts.AccountChangeSecret.AssetAmount'),
            width: '80px',
            formatter: function(row) {
              return <span>{row.snapshot.asset_amount}</span>
            }
          },
          node_amount: {
            label: this.$t('accounts.AccountChangeSecret.NodeAmount'),
            width: '80px',
            formatter: function(row) {
              return <span>{row.snapshot.node_amount}</span>
            }
          },
          status: {
            label: this.$t('accounts.AccountChangeSecret.Result'),
            width: '80px'
          },
          timedelta: {
            label: this.$t('accounts.AccountChangeSecret.TimeDelta'),
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
                  title: this.$t('accounts.AccountChangeSecret.Log'),
                  callback: function({ row }) {
                    window.open(`/#/ops/celery/task/${row.id}/log/`, '_blank', 'toolbar=yes, width=900, height=600')
                  }
                },
                {
                  name: 'detail',
                  title: this.$t('accounts.AccountChangeSecret.Detail'),
                  type: 'info',
                  can: this.$hasPerm('accounts.view_changesecretexecution'),
                  callback: function({ row }) {
                    return this.$router.push({ name: 'AccountChangeSecretExecutionDetail', params: { id: row.id }})
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        searchConfig: {
          options: [
            {
              label: this.$t('accounts.TaskID'),
              value: 'automation_id'
            }
          ]
        },
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
