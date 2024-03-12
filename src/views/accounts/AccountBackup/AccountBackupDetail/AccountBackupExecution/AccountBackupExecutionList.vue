<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { openTaskPage } from '@/utils/jms'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'AccountBackupPlanExecutionList',
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
        url: '/api/v1/accounts/account-backup-plan-executions/',
        columns: [
          'AccountBackupName', 'timedelta', 'trigger', 'date_start',
          'is_success', 'reason', 'actions'
        ],
        columnsMeta: {
          'AccountBackupName': {
            label: this.$t('common.DisplayName'),
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ row }) => row.snapshot.name,
              getRoute: ({ row }) => ({
                name: 'AccountBackupPlanDetail',
                params: { id: row.plan }
              })
            },
            id: ({ row }) => row.plan
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
                  title: this.$t('accounts.AccountChangeSecret.Log'),
                  callback: function({ row }) {
                    openTaskPage(row['id'])
                  }
                },
                {
                  name: 'detail',
                  title: this.$t('accounts.AccountChangeSecret.Detail'),
                  type: 'info',
                  callback: function({ row }) {
                    return this.$router.push({ name: 'AccountBackupPlanExecutionDetail', params: { id: row.id }})
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
              value: 'plan_id'
            },
            {
              label: this.$t('common.DisplayName'),
              value: 'plan__name'
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
    const plan_id = this.$route.query.plan_id
    if (plan_id !== undefined) {
      this.tableConfig.url = `${this.tableConfig.url}?plan_id=${plan_id}`
    }
  }
}
</script>

<style scoped>

</style>
