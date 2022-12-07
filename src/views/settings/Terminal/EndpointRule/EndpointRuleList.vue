<template>
  <div>
    <el-alert type="success" v-html="helpMessage" />
    <ListTable :table-config="tableConfig" :header-actions="headerActions" />
  </div>
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
      helpMessage: this.$t('setting.EndpointRuleListHelpMessage'),
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
              canUpdate: this.$hasPerm('terminal.change_endpointrule'),
              updateRoute: 'EndpointRuleUpdate',
              cloneRoute: 'EndpointRuleCreate'
            }
          }
        }
      },
      headerActions: {
        canCreate: this.$hasPerm('terminal.add_endpointrule'),
        hasMoreActions: false,
        createRoute: 'EndpointRuleCreate'
      }
    }
  }
}
</script>

<style scoped>

</style>
