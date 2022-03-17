<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
const performDelete = function({ row, col }) {
  const id = row.id
  const url = `${this.url}${id}/`
  return this.$axios.delete(url)
}
export default {
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/orgs/orgs/',
        permissions: {
          app: 'orgs',
          resource: 'organization'
        },
        columns: ['name',
          'resource_statistics.users_amount',
          'resource_statistics.groups_amount',
          'resource_statistics.assets_amount',
          'resource_statistics.admin_users_amount',
          'resource_statistics.system_users_amount',
          'resource_statistics.applications_amount',
          'resource_statistics.asset_perms_amount',
          'resource_statistics.app_perms_amount',
          'comment', 'actions'],
        columnsMeta: {
          'resource_statistics.users_amount': {
            label: this.$t('xpack.Organization.users_amount')
          },
          'resource_statistics.groups_amount': {
            label: this.$t('xpack.Organization.groups_amount')
          },
          'resource_statistics.assets_amount': {
            label: this.$t('xpack.Organization.assets_amount')
          },
          'resource_statistics.admin_users_amount': {
            label: this.$t('xpack.Organization.admin_users_amount')
          },
          'resource_statistics.system_users_amount': {
            label: this.$t('xpack.Organization.system_users_amount')
          },
          'resource_statistics.applications_amount': {
            label: this.$t('xpack.Organization.applications_amount')
          },
          'resource_statistics.asset_perms_amount': {
            label: this.$t('xpack.Organization.asset_perms_amount')
          },
          'resource_statistics.app_perms_amount': {
            label: this.$t('xpack.Organization.app_perms_amount')
          },
          actions: {
            prop: 'id',
            formatterArgs: {
              canDelete: function({ row }) {
                return !row.is_default && vm.$hasPerm('orgs.delete_organization')
              },
              onDelete: function({ row, col, cellValue, reload }) {
                const msg = this.$t('xpack.Organization.DeleteOrgMsg')
                const title = this.$t('xpack.Organization.DeleteOrgTitle')
                this.$alert(msg, title, {
                  type: 'warning',
                  confirmButtonClass: 'el-button--danger',
                  showCancelButton: true,
                  beforeClose: async(action, instance, done) => {
                    if (action !== 'confirm') return done()
                    instance.confirmButtonLoading = true
                    try {
                      await performDelete.bind(this)({ row: row, col: col })
                      done()
                      reload()
                      this.$message.success(this.$t('common.deleteSuccessMsg'))
                    } finally {
                      instance.confirmButtonLoading = false
                    }
                  }
                }).catch(() => {
                  /* 取消*/
                })
              }
            }
          }
        }
      },
      headerActions: {
        canCreate: this.$hasPerm('orgs.add_organization'),
        hasExport: false,
        hasImport: false,
        hasMoreActions: false
      }
    }
  }
}
</script>

<style scoped>

</style>
