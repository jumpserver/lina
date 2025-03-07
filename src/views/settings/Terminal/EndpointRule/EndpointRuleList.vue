<template>
  <div>
    <el-alert v-sanitize="helpMessage" type="success" />
    <ListTable
      ref="ListTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
      :create-drawer="createDrawer"
    />
  </div>
</template>

<script>
import { DrawerListTable as ListTable } from '@/components'

export default {
  name: 'EndpointRule',
  components: {
    ListTable
  },
  data() {
    return {
      createDrawer: () => import('./EndpointRuleCreateUpdate.vue'),
      helpMessage: this.$t('EndpointRuleListHelpMessage'),
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
