<template>
  <el-row :gutter="20">
    <ListTable :header-actions="headerActions" :table-config="config" />
  </el-row>
</template>

<script type="text/jsx">
import { ListTable } from '@/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'Publications',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    const vm = this
    return {
      headerActions: {
        hasCreate: false,
        hasImport: false,
        hasExport: false,
        hasBulkDelete: false,
        searchConfig: {
          exclude: ['applet']
        },
        extraMoreActions: [
          {
            name: 'SyncSelected',
            title: this.$t('common.bulkDeploy'),
            type: 'primary',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0
            },
            callback: function({ selectedRows }) {
              vm.$axios.post(
                `/api/v1/terminal/applet-host-deployments/applets/`,
                {
                  hosts: selectedRows.map(v => { return v.host.id }),
                  applet_id: vm.object.id
                }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }
          }
        ]
      },
      config: {
        url: `/api/v1/terminal/applet-publications/?applet=${this.object.id}`,
        columns: [
          'host.display_name', 'applet.version',
          'date_updated', 'status', 'actions'
        ],
        columnsMeta: {
          'host.display_name': {
            label: this.$t('common.DisplayName'),
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ row }) => row.host.name,
              getRoute: ({ row }) => ({
                name: 'AppletHostDetail',
                params: { id: row.host.id }
              })
            },
            id: ({ row }) => row.host.id
          },
          'applet.version': {
            label: this.$t('common.Version')
          },
          status: {
            label: this.$t('applets.PublishStatus'),
            formatter: (row) => {
              const typeMapper = {
                'pending': 'success',
                'success': 'primary',
                'failed': 'danger',
                'unknown': 'warning'
              }
              const tp = typeMapper[row.status.value] || 'warning'
              return <el-tag size='mini' type={tp}>{row.status.label}</el-tag>
            }
          },
          date_updated: {
            label: this.$t('ops.date')
          },
          actions: {
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  title: this.$t('common.Deploy'),
                  callback: function({ row }) {
                    this.$axios.post(
                      `/api/v1/terminal/applet-host-deployments/applets/`,
                      {
                        hosts: [row.host.id],
                        applet_id: vm.object.id
                      }
                    ).then(res => {
                      openTaskPage(res['task'])
                    })
                  }
                }
              ]
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
