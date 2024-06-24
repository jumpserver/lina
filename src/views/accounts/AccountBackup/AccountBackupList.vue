<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { GenericListTable } from '@/layout/components'
import { ArrayFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AccountBackupList',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/accounts/account-backup-plans/',
        permissions: {
          app: 'accounts',
          resource: 'accountbackupautomation'
        },
        columns: [
          'name', 'org_name', 'is_periodic',
          'periodic_display', 'executed_amount', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'org_name', 'periodic_display',
            'executed_amount', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountBackupDetail'
            }
          },
          types: {
            formatter: ArrayFormatter
          },
          is_periodic: {
            formatterArgs: {
              showFalse: false
            }
          },
          executed_amount: {
            formatter: DetailFormatter,
            formatterArgs: {
              can: vm.$hasPerm('accounts.view_accountbackupexecution'),
              getRoute({ row }) {
                return {
                  name: 'AccountBackupList',
                  query: {
                    tab: 'AccountBackupExecutionList',
                    plan_id: row.id
                  }
                }
              }
            }
          },
          actions: {
            formatterArgs: {
              onClone: ({ row }) => {
                vm.$router.push({ name: 'AccountBackupCreate', query: { clone_from: row.id }})
              },
              onUpdate: ({ row }) => {
                vm.$router.push({ name: 'AccountBackupUpdate', params: { id: row.id }})
              },
              extraActions: [
                {
                  title: vm.$t('Execute'),
                  name: 'execute',
                  type: 'info',
                  can: this.$hasPerm('accounts.view_accountbackupexecution'),
                  callback: function({ row }) {
                    this.$axios.post(
                      `/api/v1/accounts/account-backup-plan-executions/`,
                      { plan: row.id }
                    ).then(res => {
                      openTaskPage(res['task'])
                    })
                  }.bind(this)
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        createRoute: () => {
          return {
            name: 'AccountBackupCreate'
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
