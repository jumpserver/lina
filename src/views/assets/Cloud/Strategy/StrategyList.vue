<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script type="text/jsx">
import GenericListTable from '@/layout/components/GenericListTable'
import { DetailFormatter } from '@/components/TableFormatters'

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
          resource: 'taskstrategy'
        },
        columns: ['name', 'task_rules', 'task_actions', 'actions', 'user_actions'],
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'CloudStrategyDetail'
            }
          },
          task_rules: {
            formatter: (row) => { return row.task_rules.length }
          },
          task_actions: {
            formatter: (row) => { return row.task_actions.length }
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
        hasMoreActions: false,
        createRoute: 'CloudStrategyCreate'
      }
    }
  },
  methods: {
  }

}
</script>

<style>

</style>
