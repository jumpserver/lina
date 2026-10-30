<template>
  <GenericListTable ref="table" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import MCPClientActions, { getMCPClientActions } from '@/components/Apps/MCPClientActions'

const clientsURL = '/api/v1/authentication/user-agent-clients/'

export default {
  components: { GenericListTable },
  mixins: [MCPClientActions],
  props: {
    userId: { type: String, default: '' },
    allowRevoke: { type: Boolean, default: false }
  },
  data() {
    return {
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasExport: false,
        hasRefresh: true
      }
    }
  },
  computed: {
    canRevoke() {
      return this.allowRevoke && !this.userId
    },
    canManage() {
      return Boolean(this.userId) && this.$hasPerm('settings.change_auth')
    },
    tableConfig() {
      return {
        url: this.userId
          ? `/api/v1/authentication/agent-client-authorizations/?user_id=${this.userId}`
          : clientsURL,
        hasSelection: false,
        columns: [
          'name',
          'client_id',
          'organizations',
          'status',
          ...(this.canRevoke || this.canManage ? ['actions'] : [])
        ],
        columnsMeta: {
          name: { label: this.$t('Name'), sortable: false, formatter: (row) => row.name },
          client_id: { label: this.$t('MCPClientID'), sortable: false },
          organizations: {
            label: this.$t('Organization'),
            sortable: false,
            formatter: (row) => row.organizations.map((org) => org.name).join(', ') || '—'
          },
          status: {
            label: this.$t('Status'),
            sortable: false,
            formatter: (row) =>
              this.$t(
                {
                  active: 'MCPAuthorizationActive',
                  disabled: 'Disabled',
                  expired: 'MCPAuthorizationExpired'
                }[row.status] || row.status
              )
          },
          actions: {
            has: this.canRevoke || this.canManage,
            formatterArgs: {
              hasClone: false,
              hasDelete: false,
              hasUpdate: false,
              extraActions: this.canManage
                ? getMCPClientActions(this, 'registration_id')
                : [
                    {
                      name: 'revoke',
                      title: this.$t('Revoke'),
                      type: 'danger',
                      can: () => !this.submitting,
                      callback: ({ row }) => this.revokeClient(row)
                    }
                  ]
            }
          }
        }
      }
    }
  },
  methods: {
    async revokeClient(row) {
      if (this.submitting || !this.canRevoke) return
      this.submitting = true
      try {
        await this.$confirm(
          this.$t('MCPUserRevokeConfirm', { name: row.name }),
          this.$t('Revoke'),
          {
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
          }
        )
        await this.$axios.post(`${clientsURL}${row.id}/revoke/`, {})
        this.$message.success(this.$t('MCPUserRevokeSuccess'))
        this.$refs.table.reloadTable()
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$log.error(error)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>
