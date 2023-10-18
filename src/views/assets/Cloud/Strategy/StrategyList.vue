<template>
  <div>
    <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
    <StrategyCreateUpdate />
  </div>
</template>

<script type="text/jsx">
import GenericListTable from '@/layout/components/GenericListTable'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import StrategyCreateUpdate from './StrategyCreateUpdate.vue'

export default {
  name: 'StrategyList',
  components: {
    GenericListTable,
    StrategyCreateUpdate
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
          'strategy_actions', 'actions', 'user_actions'
        ],
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'CloudStrategyDetail'
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
              updateRoute: 'CloudStrategyUpdate',
              hasClone: false
            }
          }
        }
      },
      headerActions: {
        hasImport: false,
        hasExport: false,
        hasMoreActions: false,
        createRoute: 'CloudStrategyCreate'
      }
    }
  },
  methods: {
  }

}
</script>

<style lang='scss' scoped>

</style>
