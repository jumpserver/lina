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
            label: this.$t('assets.Name'),
            formatter: DetailFormatter,
            showOverflowTooltip: true,
            sortable: true,
            formatterArgs: {
              route: 'PlatformDetail'
            }
          },
          {
            prop: 'base',
            label: this.$t('assets.BasePlatform'),
            sortable: 'custom',
            width: '140px'
          },
          {
            prop: 'comment',
            showOverflowTooltip: true,
            label: this.$t('assets.Comment'),
            sortable: 'custom'
          },
          {
            prop: 'id',
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
        ]
      },
      headerActions: {
        hasRightActions: false,
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasBulkDelete: false,
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
