<template>
  <div>
    <ListTable ref="listTable" :header-actions="headerActions" :table-config="tableConfig" />
  </div>
</template>

<script>
import { DrawerListTable as ListTable } from '@/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'

export default {
  name: 'CommandFilterACLList',
  components: {
    ListTable
  },
  data() {
    return {
      helpMsg: this.$t('CommandFilterACLHelpMsg'),
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
              route: 'CommandFilterACLDetail'
            }
          },
          command_groups: {
            width: '160px',
            formatter: AmountFormatter,
            formatterArgs: {
              route: 'AccountGatherList',
              getRoute({ row }) {
                return {
                  name: 'CommandFilterACLList',
                  query: {
                    tab: 'CommandGroup',
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
        createRoute: 'CommandFilterACLCreate',
        canCreate: () => {
          return this.$hasPerm('acls.add_commandfilteracl') && !this.$store.getters.currentOrgIsRoot
        }
      }
    }
  }
}
</script>
