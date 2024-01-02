<template>
  <div>
    <el-alert type="success" v-html="helpMessage" />
    <ListTable :header-actions="headerActions" :table-config="tableConfig" />
  </div>
</template>

<script>
import ListTable from '@/components/Table/ListTable'

export default {
  name: 'EndpointList',
  components: {
    ListTable
  },
  data() {
    return {
      helpMessage: this.$t('setting.EndpointListHelpMessage'),
      tableConfig: {
        url: '/api/v1/terminal/endpoints/',
        columnsExclude: ['magnus_listen_db_port'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'host', 'actions',
            'http_port', 'https_port', 'ssh_port', 'rdp_port',
            'mysql_port', 'mariadb_port', 'postgresql_port',
            'redis_port', 'sqlserver_port', 'oracle_port_range'
          ]
        },
        columnsMeta: {
          name: {
            formatter: null
          },
          actions: {
            formatterArgs: {
              canUpdate: this.$hasPerm('terminal.change_endpoint'),
              updateRoute: 'EndpointUpdate',
              cloneRoute: 'EndpointCreate',
              canDelete: ({ row }) => row.id !== '00000000-0000-0000-0000-000000000001' && this.$hasPerm('terminal.delete_endpoint')
            }
          }
        }
      },
      headerActions: {
        canCreate: this.$hasPerm('terminal.add_endpoint'),
        hasMoreActions: false,
        createRoute: 'EndpointCreate'
      }
    }
  }
}
</script>

<style>

</style>
