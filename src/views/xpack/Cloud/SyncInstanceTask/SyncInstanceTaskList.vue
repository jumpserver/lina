<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { DetailFormatter } from '@/components/ListTable/formatters'

export default {
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/xpack/cloud/sync-instance-tasks/',
        columns: [
          'name', 'account_display', 'history_count', 'instance_count', 'periodic_display',
          'date_last_sync', 'comment', 'actions'
        ],
        columnsMeta: {
          account_display: {
            label: this.$t('xpack.Cloud.Account')
          },
          periodic_display: {
            showOverflowTooltip: true,
            width: '150px'
          },
          actions: {
            formatterArgs: {
              onUpdate: ({ row }) => {
                this.$router.push({ name: 'SyncInstanceTaskUpdate', params: { id: row.id }})
              },
              extraActions: [
                {
                  title: vm.$t('xpack.Execute'),
                  name: 'execute',
                  type: 'info',
                  callback: function(data) {
                    this.$axios.get(`/api/v1/xpack/cloud/sync-instance-tasks/${data.row.id}/run/`).then(res => {
                      window.open(`/#/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
                    })
                  }
                }
              ]
            }
          },
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'SyncInstanceTaskDetail',
              routeQuery: {
                activeTab: 'detail'
              }
            }
          },
          history_count: {
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'SyncInstanceTaskDetail',
              routeQuery: {
                activeTab: 'HistoryList'
              }
            }
          },
          instance_count: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'SyncInstanceTaskDetail',
              routeQuery: {
                activeTab: 'AssetList'
              }
            }
          }
        },
        date_last_sync: {
          width: '130px'
        }
      },
      headerActions: {
        hasMoreActions: false,
        hasImport: false,
        hasExport: false,
        createRoute: 'SyncInstanceTaskCreate'
      }
    }
  }
}
</script>

<style>

</style>
