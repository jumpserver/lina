<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListTable } from '@/layout/components'
import { DetailFormatter } from '@/components/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AssetChangeAuthPlanList',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/xpack/change-auth-plan/plan/',
        columns: [
          'name', 'username', 'assets_amount', 'nodes_amount', 'password_strategy_display',
          'is_periodic', 'periodic_display', 'run_times', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'username', 'password_strategy_display', 'is_periodic', 'periodic_display', 'run_times', 'actions']
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AssetChangeAuthPlanDetail'
            }
          },
          username: {
            showOverflowTooltip: true
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
          is_periodic: {
            label: vm.$t('xpack.ChangeAuthPlan.Timer'),
            formatterArgs: {
              showFalse: false
            },
            width: '80px'
          },
          periodic_display: {
            label: vm.$t('xpack.ChangeAuthPlan.TimerPeriod'),
            showOverflowTooltip: true,
            width: '150px'
          },
          run_times: {
            label: vm.$t('xpack.ChangeAuthPlan.ExecutionTimes'),
            width: '87px',
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AssetChangeAuthPlanDetail',
              routeQuery: {
                activeTab: 'AssetChangeAuthPlanExecutionList'
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
                vm.$router.push({ name: 'AssetChangeAuthPlanCreate', query: { clone_from: row.id }})
              },
              onUpdate: ({ row }) => {
                vm.$router.push({ name: 'AssetChangeAuthPlanUpdate', params: { id: row.id }})
              },
              extraActions: [
                {
                  title: vm.$t('xpack.Execute'),
                  name: 'execute',
                  can: this.$hasPerm('xpack.add_changeauthplanexecution'),
                  type: 'info',
                  callback: function({ row }) {
                    this.$axios.post(
                      `/api/v1/xpack/change-auth-plan/plan-execution/`,
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
        hasMoreActions: false,
        createRoute: () => {
          return {
            name: 'AssetChangeAuthPlanCreate'
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
