<template>
  <IBox :title="$t('MCPClients')">
    <template #header>
      <div class="clients-header">
        <h5>{{ $t('MCPClients') }}</h5>
        <el-button :disabled="submitting" @click="cleanupClients">
          {{ $t('MCPClientCleanup') }}
        </el-button>
      </div>
    </template>
    <ListTable ref="table" :header-actions="headerActions" :table-config="tableConfig" />
  </IBox>
</template>

<script>
import { IBox, ListTable } from '@/components'
import { DateFormatter } from '@/components/Table/TableFormatters'

const clientsURL = '/api/v1/authentication/agent-clients/'

export default {
  name: 'MCPClients',
  components: { IBox, ListTable },
  data() {
    return {
      submitting: false,
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasExport: false,
        hasRefresh: true,
        searchConfig: { fieldLabels: { is_active: this.$t('Active') } }
      },
      tableConfig: {
        url: clientsURL,
        hasSelection: false,
        columns: ['name', 'client_id', 'is_active', 'created', 'date_authorized', 'actions'],
        columnsMeta: {
          name: { label: this.$t('Name'), sortable: false, formatter: (row) => row.name },
          client_id: { label: this.$t('MCPClientID') },
          is_active: {
            label: this.$t('Status'),
            formatter: (row) => this.$t(row.is_active ? 'Active' : 'Disabled')
          },
          created: { label: this.$t('DateCreated'), formatter: DateFormatter },
          date_authorized: { label: this.$t('MCPClientAuthorizedAt'), formatter: DateFormatter },
          actions: {
            formatterArgs: {
              hasClone: false,
              hasDelete: false,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'enable',
                  title: this.$t('Enable'),
                  type: 'primary',
                  has: ({ row }) => !row.is_active,
                  can: () => !this.submitting && this.$hasPerm('settings.change_auth'),
                  callback: ({ row }) => this.setClientActive(row, true)
                },
                {
                  name: 'disable',
                  title: this.$t('Disable'),
                  type: 'danger',
                  has: ({ row }) => row.is_active,
                  can: () => !this.submitting && this.$hasPerm('settings.change_auth'),
                  callback: ({ row }) => this.setClientActive(row, false)
                },
                {
                  name: 'delete',
                  title: this.$t('Delete'),
                  type: 'danger',
                  can: () => !this.submitting && this.$hasPerm('settings.change_auth'),
                  callback: ({ row }) => this.deleteClient(row)
                }
              ]
            }
          }
        }
      }
    }
  },
  methods: {
    deleteClient(row) {
      return this.confirmAction(
        this.$t('MCPClientDeleteConfirm', { name: row.name }),
        this.$t('Delete'),
        async () => {
          await this.$axios.delete(`${clientsURL}${row.id}/`)
          this.$message.success(this.$t('DeleteSuccessMsg'))
        }
      )
    },
    setClientActive(row, active) {
      return this.confirmAction(
        this.$t(active ? 'MCPClientEnableConfirm' : 'MCPClientDisableConfirm', { name: row.name }),
        this.$t(active ? 'Enable' : 'Disable'),
        async () => {
          await this.$axios.post(`${clientsURL}${row.id}/${active ? 'enable' : 'disable'}/`, {})
          this.$message.success(this.$t(active ? 'EnableSuccessMsg' : 'DisableSuccessMsg'))
        },
        active ? 'primary' : 'danger'
      )
    },
    cleanupClients() {
      return this.confirmAction(
        this.$t('MCPClientCleanupConfirm'),
        this.$t('MCPClientCleanup'),
        async () => {
          const result = await this.$axios.post(`${clientsURL}cleanup/`, {})
          this.$message.success(this.$t('MCPClientCleanupResult', result))
        }
      )
    },
    async confirmAction(message, title, action, type = 'danger') {
      if (this.submitting || !this.$hasPerm('settings.change_auth')) return
      this.submitting = true
      try {
        await this.$confirm(message, title, {
          type: 'warning',
          confirmButtonClass: `el-button--${type}`,
          beforeClose: async (result, instance, done) => {
            if (instance.confirmButtonLoading) return
            if (result !== 'confirm') return done()
            instance.confirmButtonLoading = true
            try {
              await action()
              this.$refs.table?.reloadTable()
              done()
            } catch (error) {
              this.$log.error(error)
            } finally {
              instance.confirmButtonLoading = false
            }
          }
        })
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$log.error(error)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.clients-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.clients-header h5 {
  margin: 0;
}
</style>
