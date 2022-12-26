<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { ActionsFormatter } from '@/components/TableFormatters'

export default {
  components: {
    GenericListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/ops/adhocs/',
        columns: [
          'name', 'module', 'args', 'comment', 'date_updated', 'date_created', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'module', 'comment', 'args', 'comment', 'date_created', 'actions']
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              can: true,
              route: 'AdhocDetail'
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: true,
              canUpdate: true,
              updateRoute: 'AdhocUpdate',
              hasDelete: true,
              canDelete: true,
              hasClone: false,
              extraActions: [
                {
                  title: this.$t('ops.Run'),
                  name: 'run',
                  type: 'running',
                  can: true,
                  callback: ({ row }) => {
                    this.$router.push({ name: 'JobCreate', query: { type: 'adhoc', id: row.id }})
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        createRoute: 'AdhocCreate',
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasMoreActions: true
      }
    }
  }
}
</script>

<style>

</style>
