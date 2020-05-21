<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import OrgFieldsFormatter from './OrgFieldsFormatter'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/orgs/orgs/',
        columns: [
          'name', 'admins', 'auditors', 'users', 'user_groups', 'assets', 'domains',
          'admin_users', 'system_users', 'labels', 'perms', 'comment', 'actions'
        ],
        columnsMeta: {
          admins: {
            label: this.$t('xpack.Admin'),
            formatter: OrgFieldsFormatter
          },
          auditors: {
            label: this.$t('xpack.Auditor'),
            formatter: OrgFieldsFormatter
          },
          users: {
            label: this.$t('xpack.User'),
            formatter: OrgFieldsFormatter
          },
          user_groups: {
            label: this.$t('xpack.UserGroup'),
            formatter: OrgFieldsFormatter
          },
          assets: {
            label: this.$t('xpack.Asset'),
            formatter: OrgFieldsFormatter
          },
          domains: {
            label: this.$t('xpack.Domain'),
            formatter: OrgFieldsFormatter
          },
          admin_users: {
            label: this.$t('xpack.AdminUser'),
            formatter: OrgFieldsFormatter
          },
          system_users: {
            label: this.$t('xpack.SystemUser'),
            formatter: OrgFieldsFormatter
          },
          labels: {
            label: this.$t('xpack.Admin'),
            formatter: OrgFieldsFormatter
          },
          perms: {
            label: this.$t('xpack.Label'),
            formatter: OrgFieldsFormatter
          }
        },
        detailRoute: 'OrganizationDetail'
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasBulkDelete: false
      }
    }
  }
}
</script>

<style scoped>

</style>
