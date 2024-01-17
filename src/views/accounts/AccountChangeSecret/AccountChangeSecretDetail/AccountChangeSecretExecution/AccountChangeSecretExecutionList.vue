<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { openTaskPage } from '@/utils/jms'
import { DetailFormatter } from '@/components/Table/TableFormatters'

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
          'ChangeSecretName', 'asset_amount', 'node_amount', 'status',
          'trigger', 'date_start', 'date_finished', 'actions'
        ],
        columnsMeta: {
          'ChangeSecretName': {
            label: this.$t('common.DisplayName'),
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ row }) => row.snapshot.name,
              getRoute: ({ row }) => ({
                name: 'AccountChangeSecretDetail',
                params: { id: row.automation }
              })
            },
            id: ({ row }) => row.automation
          },
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
                    openTaskPage(row['id'])
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
            },
            {
              label: this.$t('common.DisplayName'),
              value: 'automation__name'
            }
          ]
        },
        hasSearch: true,
        hasRefresh: true,
        hasRightActions: true,
        hasLeftActions: false,
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
