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
            label: '管理员',
            formatter: OrgFieldsFormatter
          },
          auditors: {
            label: '审计员',
            formatter: OrgFieldsFormatter
          },
          users: {
            label: '用户',
            formatter: OrgFieldsFormatter
          },
          user_groups: {
            label: '用户组',
            formatter: OrgFieldsFormatter
          },
          assets: {
            label: '资产',
            formatter: OrgFieldsFormatter
          },
          domains: {
            label: '网域',
            formatter: OrgFieldsFormatter
          },
          admin_users: {
            label: '管理用户',
            formatter: OrgFieldsFormatter
          },
          system_users: {
            label: '系统用户',
            formatter: OrgFieldsFormatter
          },
          labels: {
            label: '标签',
            formatter: OrgFieldsFormatter
          },
          perms: {
            label: '权限管理',
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
