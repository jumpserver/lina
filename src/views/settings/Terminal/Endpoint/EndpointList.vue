<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'

export default {
  name: 'EndpointList',
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/terminal/endpoints/',
        columns: [
          'name', 'host',
          'http_port', 'https_port', 'ssh_port',
          'rdp_port', 'mysql_port', 'mariadb_port',
          'postgresql_port', 'redis_port',
          'date_created', 'comment', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'host', 'actions',
            'http_port', 'https_port', 'ssh_port', 'rdp_port'
          ]
        },
        columnsMeta: {
          name: {
            formatter: null
          },
          actions: {
            formatterArgs: {
              updateRoute: 'EndpointUpdate',
              cloneRoute: 'EndpointCreate',
              canDelete: ({ row }) => row.id !== '00000000-0000-0000-0000-000000000001'
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
