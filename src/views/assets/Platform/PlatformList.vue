<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { ActionsFormatter } from '@/components/ListTable/formatters'
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
            prop: 'actions',
            align: 'center',
            label: this.$t('assets.Action'),
            formatter: ActionsFormatter,
            width: '200px',
            formatterArgs: {
              canDelete: (row, vaule) => {
                return !row.internal
              },
              canUpdate: (row, vaule) => {
                return !row.internal
              },
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/platforms/${id}/`
                return this.$axios.delete(url)
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
