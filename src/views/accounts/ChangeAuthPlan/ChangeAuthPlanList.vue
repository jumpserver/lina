<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/TableFormatters'
import { CHANGE_PASSWORD_TYPE_META_MAP, ALL_TYPES, ASSET } from '@/views/accounts/ChangeAuthPlan/const'

export default {
  name: 'ChangeAuthPlanList',
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/xpack/change-auth-plan/plan/',
        columns: [
          'name', 'username', 'assets_amount', 'nodes_amount', 'password_strategy_display',
          'periodic_display', 'run_times', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'username', 'password_strategy_display', 'periodic_display', 'run_times', 'actions']
        },
        columnsMeta: {
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
          periodic_display: {
            label: vm.$t('xpack.ChangeAuthPlan.Timer'),
            showOverflowTooltip: true,
            width: '150px'
          },
          run_times: {
            label: vm.$t('xpack.ChangeAuthPlan.ExecutionTimes'),
            width: '87px',
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'ChangeAuthPlanDetail',
              routeQuery: {
                activeTab: 'ChangeAuthPlanExecutionList'
              }
            }
          },
          comment: {
            width: '90px'
          },
          actions: {
            width: '164px',
            formatterArgs: {
              onUpdate: ({ row }) => {
                if (row.database) {
                  vm.$router.push({ name: 'ChangeDatabaseAuthPlanUpdate', params: { id: row.id }})
                } else {
                  vm.$router.push({ name: 'ChangeAuthPlanUpdate', params: { id: row.id }})
                }
              },
              extraActions: [
                {
                  title: vm.$t('xpack.Execute'),
                  name: 'execute',
                  type: 'info',
                  callback: function({ row }) {
                    this.$axios.post(
                      `/api/v1/xpack/change-auth-plan/plan-execution/`,
                      { plan: row.id }
                    ).then(res => {
                      window.open(`/#/ops/celery/task/${res.task}/log/`, '_blank', 'toolbar=yes, width=900, height=600')
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
        moreCreates: {
          dropdown: this.getCreateType(),
          callback: (app) => {
            if (app.name === ASSET) {
              vm.$router.push({ name: 'ChangeAuthPlanCreate' })
            } else {
              vm.$router.push({ name: 'ChangeDatabaseAuthPlanCreate' })
            }
          }
        }
      }
    }
  },
  methods: {
    getCreateType() {
      const extraMoreActions = []
      for (const value of ALL_TYPES) {
        const item = { ...CHANGE_PASSWORD_TYPE_META_MAP[value] }
        item.can = true
        item.has = true
        extraMoreActions.push(item)
      }
      return extraMoreActions
    }
  }
}
</script>

<style scoped>

</style>
