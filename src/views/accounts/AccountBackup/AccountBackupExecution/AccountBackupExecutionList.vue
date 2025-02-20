<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable/index.vue'
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
          'automation', 'backup_name', 'trigger',
          'date_start', 'date_finished', 'duration', 'actions'
        ],
        columnsShow: {
          default: [
            'automation', 'backup_name', 'trigger',
            'date_start', 'date_finished', 'actions'
          ]
        },
        columnsMeta: {
          automation: {
            label: this.$t('ID'),
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountBackupExecutionDetail',
              getRoute: ({ row }) => ({
                name: 'AccountBackupExecutionDetail',
                params: { id: row.id }
              }),
              drawer: true,
              can: this.$hasPerm('accounts.view_backupaccountexecution')
            },
            width: '240px'
          },
          backup_name: {
            label: this.$t('DisplayName'),
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ row }) => row.snapshot.name,
              getRoute: ({ row }) => ({
                name: 'AccountBackupDetail',
                params: { id: row.automation }
              })
            },
            id: ({ row }) => row.automation
          },
          duration: {
            label: this.$t('TimeDelta'),
            formatter: function(row) {
              return row.duration + 's'
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
                  can: this.$hasPerm('accounts.view_backupaccountexecution'),
                  title: this.$t('Log'),
                  callback: function({ row }) {
                    openTaskPage(row['id'])
                  }
                },
                {
                  name: 'report',
                  title: this.$t('Report'),
                  type: 'success',
                  can: this.$hasPerm('accounts.view_backupaccountexecution'),
                  callback: function({ row }) {
                    window.open(`/api/v1/accounts/account-backup-plan-executions/${row.id}/report/`)
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
              value: 'automation_id'
            },
            {
              label: this.$t('DisplayName'),
              value: 'automation__name'
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
