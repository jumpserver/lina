<template>
  <TwoCol>
    <ListTable :header-actions="headerActions" :table-config="tableConfig" />
    <template #right>
      <QuickActions :actions="quickActions" type="primary" />
    </template>
  </TwoCol>
</template>

<script lang="jsx">
import { ListTable, QuickActions } from '@/components'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { openTaskPage } from '@/utils/jms/index'

export default {
  name: 'AppProviderDeployments',
  components: { ListTable, QuickActions, TwoCol },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      headerActions: {
        hasImport: false,
        hasExport: false,
        hasLeftActions: false
      },
      tableConfig: {
        hasSelection: false,
        url: `/api/v1/terminal/app-provider-deployments/?provider=${this.object.id}`,
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
                successful: 'primary',
                failed: 'danger',
                error: 'danger',
                unknown: 'warning'
              }
              const status = row.status?.value || row.status
              const label = row.status?.label || row.status
              return (
                <el-tag size="small" type={typeMapper[status] || 'info'}>
                  {label}
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
                  can: ({ row }) => Boolean(row.task),
                  callback: ({ row }) => openTaskPage(row.task)
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
            label: this.$t('Deploy'),
            disabled: !this.object.host || !this.$hasPerm('terminal.add_appproviderdeployment')
          },
          callbacks: {
            click: () => {
              this.$axios
                .post('/api/v1/terminal/app-provider-deployments/', {
                  provider: this.object.id
                })
                .then((res) => openTaskPage(res.task))
            }
          }
        }
      ]
    }
  }
}
</script>
