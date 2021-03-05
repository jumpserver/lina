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
          'name', 'base', 'comment', 'actions'
        ],
        columnsMeta: {
          base: {
            width: '140px'
          },
          actions: {
            formatterArgs: {
              canDelete: (row, value) => {
                return !row.internal
              },
              canUpdate: (row, value) => {
                return !row.internal
              }
            }
          }
        }
      },
      headerActions: {
        hasRightActions: false,
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasSearch: false,
        hasMoreActions: false,
        hasBulkDelete: false,
        createRoute: 'PlatformCreate'
      }
    }
  }
}
</script>

<style>

</style>
