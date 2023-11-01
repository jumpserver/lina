<template>
  <div>
    <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
    <AdhocUpdateCreate />
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { ActionsFormatter } from '@/components/Table/TableFormatters'
import AdhocUpdateCreate from './Adhoc/AdhocUpdateCreate.vue'

export default {
  components: {
    GenericListTable,
    AdhocUpdateCreate
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
