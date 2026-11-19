<template>
  <GenericListTable ref="table" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { DateFormatter, StatusFormatter } from '@/components/Table/TableFormatters'

const clientsURL = '/api/v1/authentication/user-agent-clients/'

export default {
  components: { GenericListTable },
  data() {
    return {
      submitting: false,
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasExport: false,
        hasRefresh: true
      }
    }
  },
  computed: {
    tableConfig() {
      return {
        url: clientsURL,
        hasSelection: false,
        columns: ['name', 'client_id', 'status', 'expires_at', 'actions'],
        columnsMeta: {
          name: { label: this.$t('Name'), sortable: false, formatter: (row) => row.name },
          client_id: { label: this.$t('MCPClientID'), sortable: false },
          expires_at: { label: this.$t('DateExpired'), sortable: false, formatter: DateFormatter },
          status: {
            label: this.$t('Status'),
            width: 100,
            align: 'center',
            sortable: false,
            formatter: StatusFormatter,
            formatterArgs: {
              faChoices: {
                active: 'fa-check-circle text-primary',
                expired: 'fa-clock text-warning',
                unknown: 'fa-question-circle text-muted'
              },
              getChoicesKey: (value) => (['active', 'expired'].includes(value) ? value : 'unknown'),
              hasTips: true,
              getTip: (value) =>
                this.$t(
                  {
                    active: 'MCPAuthorizationActive',
                    expired: 'MCPAuthorizationExpired'
                  }[value] || 'Unknown'
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
      if (this.submitting) return
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
