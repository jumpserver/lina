<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListTable } from '@/layout/components'
import { DetailFormatter } from '@/components/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AccountChangeSecretList',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/accounts/change-secret-automations/',
        columnsExclude: ['password_rules'],
        columns: ['name', 'accounts', 'secret_strategy', 'is_periodic', 'periodic_display', 'run_times', 'actions'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'accounts', 'secret_strategy', 'is_periodic', 'periodic_display', 'run_times', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountChangeSecretDetail'
            }
          },
          accounts: {
            formatter: function(row) {
              console.log('row', row)
              return <span> { row.accounts.join(', ') } </span>
            }
          },
          secret_strategy: {
            formatter: function(row) {
              return <span> { row.secret_strategy.label } </span>
            }
          },
          secret_type: {
            width: '120px'
          },
          is_periodic: {
            label: vm.$t('accounts.AccountChangeSecret.Timer'),
            formatterArgs: {
              showFalse: false
            },
            width: '80px'
          },
          periodic_display: {
            label: vm.$t('accounts.AccountChangeSecret.TimerPeriod'),
            width: '150px'
          },
          run_times: {
            label: vm.$t('accounts.AccountChangeSecret.ExecutionTimes'),
            width: '87px',
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountChangeSecretDetail',
              routeQuery: {
                activeTab: 'ChangeSecretAutomationExecutionList'
              }
            }
          },
          comment: {
            width: '90px'
          },
          actions: {
            width: '164px',
            formatterArgs: {
              onClone: ({ row }) => {
                vm.$router.push({ name: 'AccountChangeSecretCreate', query: { clone_from: row.id }})
              },
              onUpdate: ({ row }) => {
                vm.$router.push({ name: 'AccountChangeSecretUpdate', params: { id: row.id }})
              },
              extraActions: [
                {
                  title: vm.$t('xpack.Execute'),
                  name: 'execute',
                  can: this.$hasPerm('accounts.add_changesecretautomation'),
                  type: 'info',
                  callback: function({ row }) {
                    this.$axios.post(
                      `/api/v1/accounts/change-secret-executions/`,
                      {
                        automation: row.id,
                        type: row.type.value
                      }
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
            name: 'AccountChangeSecretCreate'
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
