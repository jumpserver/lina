<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { ActionsFormatter } from '@/components/Table/TableFormatters'

export default {
  components: {
    GenericListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/ops/adhocs/',
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
              canUpdate: this.$hasPerm('ops.change_adhoc'),
              updateRoute: 'AdhocUpdate',
              hasDelete: true,
              canDelete: this.$hasPerm('ops.delete_adhoc'),
              hasClone: false
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
