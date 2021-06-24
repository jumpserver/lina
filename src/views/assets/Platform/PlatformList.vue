<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/platforms/',
        columns: [
          'name', 'base',
          'comment', 'actions'
        ],
        columnsMeta: {
          base: {
            width: '140px'
          },
          actions: {
            formatterArgs: {
              canClone: true,
              canDelete: ({ row }) => {
                return !row.internal
              },
              canUpdate: ({ row }) => {
                return !row.internal
              }
            }
          }
        }
      },
      headerActions: {
        hasRightActions: true,
        hasMoreActions: false,
        hasBulkDelete: false,
        canCreate: true,
        createRoute: 'PlatformCreate'
      }
    }
  }
}
</script>

<style>

</style>
