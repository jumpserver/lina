<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AccountChangeSecretList',
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/accounts/change-secret-automations/',
        excludes: ['password_rules'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'username', 'is_periodic', 'periodic_display', 'run_times', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountChangeSecretDetail'
            }
          },
          has_secret: {
            width: '120px'
          },
          secret_type: {
            width: '120px'
          },
          secret_strategy: {
            width: '120px'
          },
          ssh_key_change_strategy: {
            width: '140px'
          },
          assets_amount: {
            label: vm.$t('xpack.ChangeAuthPlan.AssetAmount'),
            width: '80px'
          },
          nodes_amount: {
            label: vm.$t('xpack.ChangeAuthPlan.NodeAmount'),
            width: '80px'
          },
          password_strategy_display: {
            label: vm.$t('xpack.ChangeAuthPlan.PasswordStrategy'),
            width: '220px'
          },
          is_periodic: {
            label: vm.$t('xpack.ChangeAuthPlan.Timer'),
            formatterArgs: {
              showFalse: false
            },
            width: '80px'
          },
          periodic_display: {
            label: vm.$t('xpack.ChangeAuthPlan.TimerPeriod'),
            width: '150px'
          },
          run_times: {
            label: vm.$t('xpack.ChangeAuthPlan.ExecutionTimes'),
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
                vm.$router.push({ name: 'ChangeSecretAutomationCreate', query: { clone_from: row.id }})
              },
              onUpdate: ({ row }) => {
                vm.$router.push({ name: 'ChangeSecretAutomationUpdate', params: { id: row.id }})
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
