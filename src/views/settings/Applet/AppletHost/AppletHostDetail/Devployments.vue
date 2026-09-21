<template>
  <TwoCol>
    <ListTable ref="table" :header-actions="headerConfig" :table-config="config" />
    <template #right>
      <QuickActions :actions="quickActions" type="primary" />
      <TinkerDeploymentActions
        v-if="object.id"
        :key="object.id"
        :host-id="object.id"
        @changed="$refs.table?.reloadTable()"
      />
    </template>
  </TwoCol>
</template>

<script lang="jsx">
import { ListTable, QuickActions } from '@/components'
import { openTaskPage } from '@/utils/jms/index'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import TinkerDeploymentActions from './TinkerDeploymentActions.vue'
export default {
  name: 'Developments',
  components: {
    TwoCol,
    ListTable,
    QuickActions,
    TinkerDeploymentActions
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
        hasImport: false,
        hasExport: false,
        hasLeftActions: false
      },
      config: {
        hasSelection: false,
        url: `/api/v1/terminal/applet-host-deployments/?host=${this.object.id}`,
        columns: ['id', 'date_start', 'date_finished', 'status', 'actions'],
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
                pending: 'info',
                running: 'warning',
                success: 'success',
                failed: 'danger',
                error: 'danger',
                canceled: 'info',
                unknown: 'warning'
              }
              const tp = typeMapper[row.status.value] || 'info'
              return (
                <el-tag size="small" type={tp}>
                  {row.status.label}
                </el-tag>
              )
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
                  callback: function (val) {
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
          has: this.$hasPerm('terminal.add_applethostdeployment'),
          attrs: {
            type: 'primary',
            label: this.$t('Deploy')
          },
          callbacks: {
            click: function () {
              this.$axios
                .post(`/api/v1/terminal/applet-host-deployments/`, {
                  host: this.object.id
                })
                .then((res) => {
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

<style scoped></style>
