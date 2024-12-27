<template>
  <el-row :gutter="20">
    <el-col :md="24" :sm="24">
      <ListTable :header-actions="headerConfig" :table-config="config" />
    </el-col>
    <el-col :md="20" :sm="24" class="detail-right-quick-actions">
      <QuickActions :actions="quickActions" type="primary" />
    </el-col>
  </el-row>
</template>

<script>
import { ListTable, QuickActions } from '@/components'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'Developments',
  components: {
    ListTable,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      headerConfig: {
        hasImport: false,
        hasExport: false,
        hasLeftActions: false
      },
      config: {
        hasSelection: false,
        url: `/api/v1/terminal/applet-host-deployments/?host=${this.object.id}`,
        columns: [
          'id', 'date_start', 'date_finished', 'status', 'actions'
        ],
        columnsMeta: {
          id: {
            type: 'index',
            label: 'ID',
            sortable: 'custom'
          },
          status: {
            label: this.$t('Status'),
            formatter: (row) => {
              const typeMapper = {
                'pending': 'success',
                'success': 'primary',
                'failed': 'danger',
                'unknown': 'warning'
              }
              const tp = typeMapper[row.status.value] || 'info'
              return <el-tag size='mini' type={tp}>{row.status.label}</el-tag>
            }
          },
          actions: {
            formatterArgs: {
              hasClone: false,
              hasDelete: false,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('View'),
                  type: 'primary',
                  callback: function(val) {
                    openTaskPage(val.row.task)
                  }
                }
              ]
            }
          }
        }
      },
      quickActions: [
        {
          title: this.$t('InitialDeploy'),
          attrs: {
            type: 'primary',
            label: this.$t('Deploy')
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
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
