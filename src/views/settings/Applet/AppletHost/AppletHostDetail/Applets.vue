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
          'applet.icon', 'applet.display_name', 'date_updated', 'status',
          'actions'
        ],
        columnsMeta: {
          'applet.icon': {
            label: this.$t('common.Icon'),
            align: 'center',
            width: '60px',
            formatter: (row) => {
              return <img src={row.applet.icon} width='30' height='30' alt='icon'></img>
            }
          },
          'applet.display_name': {
            label: this.$t('common.DisplayName')
          },
          status: {
            label: this.$t('common.Status'),
            formatter: (row) => {
              if (!row.status) {
                return <el-tag size='mini' type='danger'>{ this.$t('applets.NoPublished') }</el-tag>
              }
              return row.status.label
            }
          },
          date_updated: {
            label: '发布日期'
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
