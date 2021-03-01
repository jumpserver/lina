<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="title" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/cmd-filters/',
        columns: ['name', 'rules', 'system_users', 'is_active', 'date_created', 'comment', 'actions'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'rules', 'system_users', 'comment', 'actions']
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
        createRoute: 'CommandFilterCreate'
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
