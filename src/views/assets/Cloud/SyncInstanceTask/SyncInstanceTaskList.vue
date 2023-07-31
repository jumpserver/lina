<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { DetailFormatter } from '@/components/Table/TableFormatters'
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
        columnsShow: {
          min: ['name', 'account', 'hostname_strategy', 'actions'],
          default: [
            'name', 'account', 'hostname_strategy', 'protocols', 'is_periodic', 'actions'
          ]
        },
        columnsMeta: {
          sync_ip_type: {
            width: '120px'
          },
          hostname_strategy: {
            width: '150px',
            formatter: function(row) {
              return <span>{ row.hostname_strategy.label }</span>
            }
          },
          account: {
            label: this.$t('xpack.Cloud.Account'),
            formatter: function(row) {
              return <span>{ row.account?.name }</span>
            }
          },
          periodic_display: {
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
                  can: () => vm.$hasPerm('xpack.add_syncinstancetaskexecution'),
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
              route: 'SyncInstanceTaskDetail'
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
