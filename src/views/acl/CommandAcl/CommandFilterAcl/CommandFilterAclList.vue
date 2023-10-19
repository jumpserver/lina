<template>
  <div>
    <el-alert type="success">{{ helpMsg }}</el-alert>
    <ListTable :header-actions="headerActions" :table-config="tableConfig" />
  </div>

</template>

<script>
import { ListTable } from '@/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'

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
            'name', 'command_groups', 'priority',
            'is_active', 'comment', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'CommandFilterAclDetail'
            }
          },
          command_groups: {
            label: this.$t('acl.CommandGroup'),
            width: '160px',
            formatter: AmountFormatter,
            formatterArgs: {
              route: 'AccountGatherList',
              getRoute({ row }) {
                return {
                  name: 'CommandFilterAclList',
                  query: {
                    activeTab: 'CommandGroup',
                    command_filters: row.id
                  }
                }
              }
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
