<template>
  <div>
    <el-alert type="success">{{ helpMsg }}</el-alert>
    <ListTable :header-actions="headerActions" :table-config="tableConfig" />
  </div>

</template>

<script>
import { ListTable } from '@/components'
import { DetailFormatter } from '@/components/TableFormatters'

export default {
  components: {
    ListTable
  },
  data() {
    return {
      helpMsg: this.$t('acl.CommandFilterACLHelpMsg'),
      tableConfig: {
        url: '/api/v1/acls/command-filter-acls/',
        permissions: {
          app: 'acls',
          resource: 'commandfilteracl'
        },
        columnsExclude: ['users', 'assets', 'accounts'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'command_groups_amount', 'priority',
            'is_active', 'comment', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'CommandFilterAclDetail'
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
        createRoute: 'CommandFilterAclCreate',
        canCreate: () => {
          return this.$hasPerm('acls.add_commandfilteracl') && !this.$store.getters.currentOrgIsRoot
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
