<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { openTaskPage } from '@/utils/jms'
import { DetailFormatter } from '@/components/Table/TableFormatters'

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
    return {
      tableConfig: {
        url: '/api/v1/accounts/push-account-executions/?' + `${this.object.id ? 'automation_id=' + this.object.id : ''}`,
        columns: [
          'PushUserName', 'asset_amount', 'node_amount', 'status',
          'trigger', 'date_start', 'date_finished', 'actions'
        ],
        columnsMeta: {
          'PushUserName': {
            label: this.$t('common.DisplayName'),
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ row }) => row.snapshot.name,
              getRoute: ({ row }) => ({
                name: 'AccountPushDetail',
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
                  can: 'accounts.view_pushaccountexecution',
                  title: this.$t('accounts.AccountChangeSecret.Log'),
                  callback: function({ row }) {
                    openTaskPage(row['id'])
                  }
                },
                {
                  name: 'detail',
                  title: this.$t('accounts.AccountChangeSecret.Detail'),
                  type: 'info',
                  can: this.$hasPerm('accounts.view_pushaccountexecution'),
                  callback: function({ row }) {
                    return this.$router.push({ name: 'AccountPushExecutionDetail', params: { id: row.id }})
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
        hasLeftActions: true,
        hasMoreActions: false,
        hasExport: false,
        hasImport: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false
      }
    }
  },
  mounted() {
    const automation_id = this.$route.query.automation_id
    if (automation_id !== undefined) {
      this.tableConfig.url = `${this.tableConfig.url}?automation_id=${automation_id}`
    }
  }
}
</script>

<style scoped>

</style>
