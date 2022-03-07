<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AccountBackupPlanList',
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/assets/account-backup-plans/',
        columns: [
          'name', 'is_periodic', 'periodic_display', 'org_name', 'comment', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'org_name', 'is_periodic', 'periodic_display', 'actions']
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountBackupPlanDetail'
            }
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
          comment: {
            width: '90px'
          },
          actions: {
            width: '164px',
            formatterArgs: {
              onClone: ({ row }) => {
                vm.$router.push({ name: 'AccountBackupPlanCreate', query: { clone_from: row.id }})
              },
              onUpdate: ({ row }) => {
                vm.$router.push({ name: 'AccountBackupPlanUpdate', params: { id: row.id }})
              },
              extraActions: [
                {
                  title: vm.$t('xpack.Execute'),
                  name: 'execute',
                  type: 'info',
                  callback: function({ row }) {
                    this.$axios.post(
                      `/api/v1/assets/account-backup-plan-executions/`,
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
            name: 'AccountBackupPlanCreate'
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
