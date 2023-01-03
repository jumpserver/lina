<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { DetailFormatter } from '@/components/TableFormatters'
import { openTaskPage } from '@/utils/jms'
import GenericListPage from '@/layout/components/GenericListPage'

export default {
  name: 'AccountPushList',
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/accounts/push-account-automations/',
        excludes: ['password_rules', 'type'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'username', 'triggers', 'secret_type', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountChangeSecretDetail'
            }
          },
          username: {
            showOverflowTooltip: true,
            formatter: ({ username }) => {
              if (username === '@USER') {
                return this.$t('accounts.DynamicUsername')
              } else {
                return username
              }
            }
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
            width: '220px',
            showOverflowTooltip: true
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
          is_active: {
            width: '87px'
          },
          comment: {
            width: '90px'
          },
          actions: {
            width: '164px',
            formatterArgs: {
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
        hasImport: false
      }
    }
  }
}
</script>

<style scoped>

</style>
