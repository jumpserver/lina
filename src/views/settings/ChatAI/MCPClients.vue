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
import MCPClientActions, { getMCPClientActions } from '@/components/Apps/MCPClientActions'

const clientsURL = '/api/v1/authentication/agent-clients/'

export default {
  name: 'MCPClients',
  components: { IBox, ListTable },
  mixins: [MCPClientActions],
  data() {
    return {
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
              extraActions: getMCPClientActions(this)
            }
          }
        }
      }
    }
  },
  methods: {
    cleanupClients() {
      return this.confirmAction(
        this.$t('MCPClientCleanupConfirm'),
        this.$t('MCPClientCleanup'),
        async () => {
          const result = await this.$axios.post(`${clientsURL}cleanup/`, {})
          this.$message.success(this.$t('MCPClientCleanupResult', result))
        }
      )
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
