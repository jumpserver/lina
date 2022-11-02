<template>
  <el-row :gutter="20">
    <el-col :md="16" :sm="24">
      <ListTable :table-config="config" :header-actions="headerConfig" />
    </el-col>
    <el-col :md="8" :sm="24">
      <QuickActions type="primary" :actions="quickActions" />
    </el-col>
  </el-row>
</template>

<script type="text/jsx">
import { ListTable, QuickActions } from '@/components'
import { openTaskPage } from '@/utils/jms'
import { DetailFormatter } from '@/components/TableFormatters'
export default {
  name: 'Publications',
  components: {
    ListTable,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      headerConfig: {
        hasImport: false
      },
      config: {
        url: `/api/v1/terminal/applet-publications/?host=${this.object.id}`,
        columns: [
          'applet.display_name', 'date_updated', 'status',
          'actions'
        ],
        columnsMeta: {
          'applet.display_name': {
            label: this.$t('common.DisplayName'),
            formatter: DetailFormatter,
            formatterArgs: {
              getIcon: ({ row }) => row.applet?.icon,
              getTitle: ({ row }) => row.applet.display_name
            }
          },
          status: {
            label: this.$t('applets.PublishStatus'),
            formatter: (row) => {
              const typeMapper = {
                'ready': 'info',
                'pending': 'info',
                'running': 'success',
                'success': 'success',
                'failed': 'danger'
              }
              const tp = typeMapper[row.status.value] || 'info'
              return <el-tag size='mini' type={tp}>{ row.status.label }</el-tag>
            }
          },
          date_updated: {
            label: '日期'
          },
          actions: {
            formatterArgs: {
              updateRoute: 'AppletPublicationUpdate'
            }
          }
        }
      },
      quickActions: [
        {
          title: this.$t('assets.InitialDeploy'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Deploy')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/terminal/applet-host-deployments/`,
                { host: this.object.id }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }.bind(this)
          }
        },
        {
          title: '发布所有应用',
          attrs: {
            type: 'primary',
            label: this.$t('common.Publish')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/assets/assets/${this.object.id}/tasks/`,
                { action: 'refresh' }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }.bind(this)
          }
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
