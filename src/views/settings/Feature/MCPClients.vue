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
                  name: 'disable',
                  title: this.$t('Disable'),
                  type: 'danger',
                  can: ({ row }) =>
                    row.is_active && !this.submitting && this.$hasPerm('settings.change_auth'),
                  callback: ({ row }) => this.disableClient(row)
                }
              ]
            }
          }
        }
      }
    }
  },
  methods: {
    disableClient(row) {
      return this.confirmAction(
        this.$t('MCPClientDisableConfirm', { name: row.name }),
        this.$t('Disable'),
        async () => {
          await this.$axios.post(`${clientsURL}${row.id}/disable/`, {})
          this.$message.success(this.$t('DisableSuccessMsg'))
        }
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
    async confirmAction(message, title, action) {
      if (this.submitting || !this.$hasPerm('settings.change_auth')) return
      this.submitting = true
      try {
        await this.$confirm(message, title, {
          type: 'warning',
          confirmButtonClass: 'el-button--danger',
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
