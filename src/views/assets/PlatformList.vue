<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, ActionsFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/platforms/',
        columns: [
          {
            prop: 'name',
            label: this.$t('assets.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'PlatformDetail'
          },
          {
            prop: 'base',
            label: this.$t('assets.BasePlatform'),
            sortable: 'custom'
          },
          {
            prop: 'comment',
            label: this.$t('assets.comment'),
            sortable: 'custom'
          },
          {
            prop: 'id',
            label: this.$tc('Action'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
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
        ]
      },
      headerActions: {
        hasRightActions: false,
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasBulkDelete: false,
        hasSearch: false,
        createRoute: 'PlatformCreate'
      }
    }
  }
}
</script>

<style>

</style>
