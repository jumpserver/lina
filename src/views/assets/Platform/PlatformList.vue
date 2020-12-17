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
        createRoute: 'PlatformCreate'
      }
    }
  }
}
</script>

<style>

</style>
