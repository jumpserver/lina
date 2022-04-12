<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
import { ArrayFormatter } from '@/components/TableFormatters'
export default {
  name: 'EndpointRule',
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/terminal/endpoint-rules/',
        columns: [
          'name', 'ip_group', 'priority', 'endpoint_display', 'date_updated', 'date_created',
          'created_by', 'comment', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'ip_group', 'priority', 'endpoint_display', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: null
          },
          ip_group: {
            formatter: ArrayFormatter,
            showOverflowTooltip: true
          },
          actions: {
            formatterArgs: {
              updateRoute: 'EndpointRuleUpdate',
              cloneRoute: 'EndpointRuleCreate'
            }
          }
        }
      },
      headerActions: {
        hasMoreActions: false,
        createRoute: 'EndpointRuleCreate'
      }
    }
  }
}
</script>

<style scoped>

</style>
