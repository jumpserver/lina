<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { DetailFormatter } from '@/components/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'SyncInstanceTaskList',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/xpack/cloud/sync-instance-tasks/',
        permissions: {
          app: 'xpack',
          resource: 'syncinstancetask'
        },
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
              hasClone: false,
              onUpdate: ({ row }) => {
                this.$router.push({ name: 'SyncInstanceTaskUpdate', params: { id: row.id }})
              },
              extraActions: [
                {
                  title: vm.$t('xpack.Execute'),
                  name: 'execute',
                  type: 'info',
                  can: () => vm.$hasPerm('xpack.change_syncinstancetask'),
                  callback: function(data) {
                    this.$axios.get(`/api/v1/xpack/cloud/sync-instance-tasks/${data.row.id}/run/`).then(res => {
                      openTaskPage(res['task'])
                    })
                  }
                }
              ]
            }
          },
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              permissions: 'xpack.view_syncinstancedetail',
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
              permissions: 'xpack.view_syncinstancetaskexecution',
              route: 'SyncInstanceTaskDetail',
              routeQuery: {
                activeTab: 'HistoryList'
              }
            }
          },
          instance_count: {
            formatter: DetailFormatter,
            formatterArgs: {
              permissions: 'xpack.view_syncinstancetask',
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
