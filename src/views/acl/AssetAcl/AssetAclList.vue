<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/acls/login-asset-acls/',
        columns: [
          'name', 'user_username_group', 'hostname_group', 'ip_group', 'name_group',
          'protocol_group', 'systemuser_username_group', 'reviewers', 'priority',
          'is_active', 'comment', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'user_username_group', 'hostname_group', 'ip_group', 'reviewers',
            'priority', 'is_active', 'comment', 'actions'
          ]
        },
        columnsMeta: {
          user_username_group: {
            prop: 'users.username_group',
            showOverflowTooltip: true,
            formatter: function(row) {
              return <span> {row.users.username_group.toString()} </span>
            },
            label: this.$t('acl.username_group')
          },
          reviewers: {
            prop: 'reviewers_amount'
          },
          hostname_group: {
            prop: 'assets.hostname_group',
            label: this.$t('acl.hostname_group'),
            showOverflowTooltip: true,
            formatter: function(row) {
              return <span> {row.assets.hostname_group.toString()} </span>
            }
          },
          ip_group: {
            prop: 'assets.ip_group',
            label: this.$t('acl.asset_ip_group'),
            showOverflowTooltip: true,
            formatter: function(row) {
              return <span> {row.assets.ip_group.toString()} </span>
            }
          },
          name_group: {
            prop: 'system_users.name_group',
            label: this.$t('acl.system_users_name_group'),
            showOverflowTooltip: true,
            formatter: function(row) {
              return <span> {row.system_users.name_group.toString()} </span>
            }
          },
          protocol_group: {
            prop: 'system_users.protocol_group',
            label: this.$t('acl.system_users_protocol_group'),
            showOverflowTooltip: true,
            formatter: function(row) {
              return <span> {row.system_users.protocol_group.toString()} </span>
            }
          },
          systemuser_username_group: {
            prop: 'system_users.username_group',
            label: this.$t('acl.system_users_username_group'),
            showOverflowTooltip: true,
            formatter: function(row) {
              return <span> {row.system_users.username_group.toString()} </span>
            }
          }
        }
      },
      updateRoute: 'AssetAclUpdate',
      headerActions: {
        createRoute: 'AssetAclCreate',
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasMoreActions: false
      }
    }
  }
}
</script>

<style>

</style>
