<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="title" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/TableFormatters'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/cmd-filters/',
        permissions: {
          app: 'assets',
          resource: 'commandfilter'
        },
        columns: [
          'name', 'rules', 'users', 'user_groups', 'assets', 'applications', 'system_users', 'is_active',
          'created_by', 'date_created', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'rules', 'comment', 'actions']
        },
        columnsMeta: {
          rules: {
            label: this.$t('assets.Rules'),
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ cellValue }) => {
                return cellValue.length
              },
              routeQuery: {
                activeTab: 'rules'
              }
            }
          },
          date_created: {
            label: this.$t('users.DateJoined')
          },
          users: {
            formatter: function(row, col, cell) {
              return cell.length
            }
          },
          user_groups: {
            formatter: function(row, col, cell) {
              return cell.length
            }
          },
          assets: {
            formatter: function(row, col, cell) {
              return cell.length
            }
          },
          applications: {
            formatter: function(row, col, cell) {
              return cell.length
            }
          },
          system_users: {
            label: this.$t('assets.SystemUsers'),
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'CommandFilterDetail',
              getTitle: ({ cellValue }) => {
                return cellValue.length
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
        hasMoreActions: false,
        createRoute: 'CommandFilterCreate',
        canCreate: () => {
          return this.$hasPerm('assets.add_commandfilter')
        }
      }
    }
  },
  computed: {
    title() {
      return this.$t('assets.CommandFilterHelpMessage')
    }
  }
}
</script>

<style>

</style>
