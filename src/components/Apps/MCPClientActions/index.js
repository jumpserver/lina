const clientsURL = '/api/v1/authentication/agent-clients/'

export function getMCPClientActions(vm, idField = 'id') {
  const hasRegistration = (row) => row[idField] != null && typeof row.is_active === 'boolean'
  const registration = (row) => ({ ...row, id: row[idField] })
  const can = () => !vm.submitting && vm.$hasPerm('settings.change_auth')
  return [
    {
      name: 'enable',
      title: vm.$t('Enable'),
      type: 'primary',
      has: ({ row }) => hasRegistration(row) && !row.is_active,
      can,
      callback: ({ row }) => vm.setClientActive(registration(row), true)
    },
    {
      name: 'disable',
      title: vm.$t('Disable'),
      type: 'danger',
      has: ({ row }) => hasRegistration(row) && row.is_active,
      can,
      callback: ({ row }) => vm.setClientActive(registration(row), false)
    },
    {
      name: 'delete',
      title: vm.$t('Delete'),
      type: 'danger',
      has: ({ row }) => hasRegistration(row),
      can,
      callback: ({ row }) => vm.deleteClient(registration(row))
    }
  ]
}

export default {
  data() {
    return { submitting: false }
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
