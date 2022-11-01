<template>
  <el-row :gutter="20">
    <el-col :md="16" :sm="24">
      <ListTable :table-config="config" />
    </el-col>
    <el-col :md="8" :sm="24">
      <QuickActions type="primary" :actions="quickActions" />
    </el-col>
  </el-row>
</template>

<script>
import { ListTable, QuickActions } from '@/components'
import { openTaskPage } from '@/utils/jms'
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
      config: {
        url: `/api/v1/terminal/applet-publications/?host=${this.object.id}`,
        columns: [
          'name', 'applet', 'comment', 'date_created', 'date_updated', 'actions'
        ],
        columnsMeta: {
          applet: {
            formatter: (row) => {
              return row.applet.name
            }
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
          title: '同步所有应用',
          attrs: {
            type: 'primary',
            label: this.$t('common.Sync')
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
