<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script type="text/jsx">
import GenericListTable from '@/layout/components/GenericListTable'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'StrategyList',
  components: {
    GenericListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/xpack/cloud/strategies/',
        permissions: {
          app: 'xpack',
          resource: 'strategy'
        },
        columns: [
          'name', 'priority', 'strategy_rules',
          'strategy_actions', 'actions', 'rule_relation'
        ],
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              getRoute: ({ row }) => ({
                name: 'CloudStrategyDetail', params: { id: row.id },
                query: { category: this.$route.query.category || 'host' }
              })
            }
          },
          strategy_rules: {
            formatter: (row) => { return row.strategy_rules.length }
          },
          strategy_actions: {
            formatter: (row) => { return row.strategy_actions.length }
          },
          actions: {
            formatterArgs: {
              updateRoute: ({ row }) => {
                return {
                  name: 'CloudStrategyUpdate', params: { id: row.id },
                  query: { category: this.$route.query.category || 'host' }
                }
              },
              hasClone: false,
              canDelete: ({ row }) => { return row.name !== 'default' },
              canUpdate: ({ row }) => { return row.name !== 'default' }
            }
          }
        }
      },
      headerActions: {
        hasImport: false,
        hasExport: false,
        hasMoreActions: false,
        createRoute: () => {
          return {
            name: 'CloudStrategyCreate', query: { category: this.$route.query.category || 'host' }
          }
        }
      }
    }
  },
  methods: {
  }

}
</script>

<style lang='scss' scoped>

</style>
