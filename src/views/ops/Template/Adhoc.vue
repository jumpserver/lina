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
    const currentUserID = this.$store.state.users.profile.id
    return {
      tableConfig: {
        url: '/api/v1/ops/adhocs/',
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'module', 'args', 'comment', 'scope', 'date_created', 'actions', 'created_by']
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
              canUpdate: ({ row }) => {
                return this.$hasPerm('ops.change_adhoc') && row.creator === currentUserID
              },
              updateRoute: 'AdhocUpdate',
              hasDelete: true,
              canDelete: ({ row }) => {
                return this.$hasPerm('ops.delete_adhoc') && row.creator === currentUserID
              },
              hasClone: true,
              cloneRoute: 'AdhocCreate'
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
