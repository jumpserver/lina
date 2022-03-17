<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListTable } from '@/layout/components'
import { DetailFormatter } from '@/components/TableFormatters'
import { openTaskPage } from '@/utils/jms'
import { AppPlanDatabase } from '@/views/applications/const'

export default {
  name: 'AppChangeAuthPlanList',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        permissions: {
          'app': 'xpack',
          'resource': 'applicationchangeauthplan'
        },
        url: '/api/v1/xpack/change-auth-plan/app-plan/',
        columns: [
          'name', 'password_strategy_display', 'is_periodic', 'periodic_display',
          'run_times', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'password_strategy_display', 'is_periodic',
            'periodic_display', 'run_times', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AppChangeAuthPlanDetail'
            }
          },
          systemuser_display: {
            label: vm.$t('xpack.ChangeAuthPlan.SystemUser'),
            width: '300px',
            showOverflowTooltip: true
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
              route: 'AppChangeAuthPlanDetail',
              routeQuery: {
                activeTab: 'AppChangeAuthPlanExecutionList'
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
                vm.$router.push({
                  name: 'AppChangeAuthPlanCreate',
                  query: {
                    clone_from: row.id,
                    category: row.category.toLowerCase(),
                    type: row.type.toLowerCase()
                  }
                })
              },
              onUpdate: ({ row }) => {
                vm.$router.push({
                  name: 'AppChangeAuthPlanUpdate',
                  params: { id: row.id },
                  query: {
                    category: row.category.toLowerCase(),
                    type: row.type.toLowerCase()
                  }
                })
              },
              extraActions: [
                {
                  title: vm.$t('xpack.Execute'),
                  name: 'execute',
                  can: this.$hasPerm('xpack.add_applicationchangeauthplanexecution'),
                  type: 'info',
                  callback: function({ row }) {
                    this.$axios.post(
                      `/api/v1/xpack/change-auth-plan/app-plan-execution/`,
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
        searchConfig: {
          getUrlQuery: false
        },
        moreCreates: {
          callback: (option) => {
            vm.$router.push({ name: 'AppChangeAuthPlanCreate', query: {
              category: option.category.toLowerCase(),
              type: option.name.toLowerCase()
            }})
          },
          dropdown: AppPlanDatabase
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
