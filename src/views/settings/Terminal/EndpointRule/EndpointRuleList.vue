<template>
  <div>
    <el-alert type="success" v-html="helpMessage" />
    <ListTable :header-actions="headerActions" :table-config="tableConfig" />
    <EndpointRuleCreateUpdate />
  </div>
</template>

<script>
import ListTable from '@/components/Table/ListTable'
import EndpointRuleCreateUpdate from './EndpointRuleCreateUpdate.vue'

export default {
  name: 'EndpointRule',
  components: {
    EndpointRuleCreateUpdate,
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
              canUpdate: this.$hasPerm('terminal.change_endpointrule')
            }
          }
        }
      },
      headerActions: {
        hasMoreActions: false
      }
    }
  }
}
</script>

<style scoped>

</style>
