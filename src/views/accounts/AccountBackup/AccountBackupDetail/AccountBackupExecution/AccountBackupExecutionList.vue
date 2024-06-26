<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { openTaskPage } from '@/utils/jms'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'AccountBackupExecutionList',
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
          'automation', 'account_backup_name', 'timedelta', 'trigger', 'date_start',
          'is_success', 'reason', 'actions'
        ],
        columnsShow: {
          default: [
            'automation', 'account_backup_name', 'timedelta', 'date_start',
            'is_success', 'reason', 'actions'
          ]
        },
        columnsMeta: {
          automation: {
            label: this.$t('TaskID'),
            formatter: function(row) {
              return <span>{row.plan}</span>
            }
          },
          account_backup_name: {
            label: this.$t('DisplayName'),
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ row }) => row.snapshot.name,
              getRoute: ({ row }) => ({
                name: 'AccountBackupDetail',
                params: { id: row.plan }
              })
            },
            id: ({ row }) => row.plan
          },
          timedelta: {
            label: this.$t('TimeDelta'),
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
                  title: this.$t('Log'),
                  callback: function({ row }) {
                    openTaskPage(row['id'])
                  }
                },
                {
                  name: 'detail',
                  title: this.$t('Detail'),
                  type: 'info',
                  callback: function({ row }) {
                    return this.$router.push({ name: 'AccountBackupExecutionDetail', params: { id: row.id }})
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
              label: this.$t('TaskID'),
              value: 'plan_id'
            },
            {
              label: this.$t('DisplayName'),
              value: 'plan__name'
            }
          ]
        },
        hasRefresh: true,
        hasRightActions: true,
        hasLeftActions: false,
        hasMoreActions: false,
        hasExport: false,
        hasImport: false,
        hasCreate: false
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
