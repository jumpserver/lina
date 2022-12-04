<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { ListTable } from '@/components'

export default {
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/acls/command-filter-acls/',
        permissions: {
          app: 'acls',
          resource: 'commandfilteracl'
        },
        columns: [
          'name', 'user_username_group', 'asset_name_group', 'asset_address_group',
          'account_username_group', 'command_groups', 'action',
          'date_created', 'created_by', 'org_name',
          'comment', 'is_active', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'user_username_group', 'asset_name_group', 'asset_address_group',
            'account_username_group', 'command_groups', 'comment', 'actions'
          ]
        },
        columnsMeta: {
          user_username_group: {
            prop: 'users.username_group',
            showOverflowTooltip: true,
            formatter: function(row) {
              return <span> {row.users.username_group.toString()} </span>
            },
            label: this.$t('acl.UserUsername')
          },
          asset_name_group: {
            prop: 'assets.name_group',
            showOverflowTooltip: true,
            formatter: function(row) {
              return <span> {row.assets.name_group.toString()} </span>
            },
            label: this.$t('acl.AssetName')
          },
          asset_address_group: {
            prop: 'assets.address_group',
            showOverflowTooltip: true,
            formatter: function(row) {
              return <span> {row.assets.address_group.toString()} </span>
            },
            label: this.$t('acl.AssetAddress')
          },
          account_username_group: {
            prop: 'accounts.username_group',
            showOverflowTooltip: true,
            formatter: function(row) {
              return <span> {row.accounts.username_group.toString()} </span>
            },
            label: this.$t('acl.AccountUsername')
          },
          command_groups: {
            label: this.$t('acl.CommandGroup'),
            formatter: function(row) {
              return <span> { row.command_groups.length }</span>
            }
          }
        }
      },
      headerActions: {
        hasRightActions: true,
        hasExport: false,
        hasImport: false,
        hasRefresh: true,
        hasSearch: true,
        hasMoreActions: false,
        createRoute: 'CommandFilterAclCreate',
        canCreate: () => {
          return this.$hasPerm('acls.add_commandfilteracl')
        }
      }
    }
  },
  computed: {
  }
}
</script>

<style>

</style>
