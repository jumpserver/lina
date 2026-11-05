<template>
  <TwoCol>
    <ListTable ref="table" :header-actions="headerConfig" :table-config="config" />
    <template #right>
      <QuickActions
        v-if="$hasPerm(['terminal.view_applethost', 'terminal.add_applethostdeployment'])"
        :actions="quickActions"
        type="primary"
      />
    </template>
  </TwoCol>
</template>

<script lang="jsx">
import { ListTable, QuickActions } from '@/components'
import { openTaskPage } from '@/utils/jms/index'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
export default {
  name: 'Developments',
  components: {
    TwoCol,
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
                pending: 'success',
                success: 'primary',
                failed: 'danger',
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
          title: this.$t('HostDeployment'),
          attrs: {
            type: 'primary',
            label: this.$t('Deploy'),
            loading: false
          },
          callbacks: {
            click: async (_, action) => {
              const host = this.object.id
              if (
                !host ||
                action.attrs.loading ||
                !this.$hasPerm(['terminal.view_applethost', 'terminal.add_applethostdeployment'])
              ) {
                return
              }
              action.attrs.loading = true
              try {
                await this.$confirm(this.$t('AppletHostDeployConfirm'), this.$t('Deploy'), {
                  type: 'warning',
                  confirmButtonText: this.$t('Deploy'),
                  cancelButtonText: this.$t('Cancel')
                })
                const result = await this.$axios.post('/api/v1/terminal/applet-host-deployments/', {
                  host
                })
                this.$refs.table?.reloadTable()
                openTaskPage(result.task)
              } catch {
                // Cancellation needs no action; request errors are shown by the request client.
              } finally {
                action.attrs.loading = false
              }
            }
          }
        }
      ]
    }
  }
}
</script>

<style scoped></style>
