<template>
  <div>
    <el-alert type="success" v-html="helpMessage" />
    <ListTable :header-actions="headerActions" :table-config="tableConfig" />
  </div>
</template>

<script>
import ListTable from '@/components/Table/ListTable'

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
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'ip_group', 'priority', 'endpoint', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: null
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
