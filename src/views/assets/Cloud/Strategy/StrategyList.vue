<template>
  <DrawerListTable
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :header-actions="headerActions"
    :table-config="tableConfig"
  />
</template>

<script type="text/jsx">
import { DrawerListTable } from '@/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'StrategyList',
  components: {
    DrawerListTable
  },
  data() {
    return {
      createDrawer: () => import('@/views/assets/Cloud/Strategy/StrategyCreateUpdate.vue'),
      detailDrawer: () => import('@/views/assets/Cloud/Strategy/StrategyDetail/index.vue'),
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
              route: 'CloudStrategyDetail'
            }
          },
          strategy_rules: {
            formatter: (row) => {
              return row.strategy_rules.length
            }
          },
          strategy_actions: {
            formatter: (row) => {
              return row.strategy_actions.length
            }
          },
          actions: {
            formatterArgs: {
              updateRoute: 'CloudStrategyUpdate',
              hasClone: false,
              canDelete: ({ row }) => {
                return row.name !== 'default'
              },
              canUpdate: ({ row }) => {
                return row.name !== 'default'
              }
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
  methods: {}

}
</script>

<style lang='scss' scoped>

</style>
