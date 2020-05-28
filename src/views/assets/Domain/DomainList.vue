<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="notice" />
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
        url: '/api/v1/assets/domains/',
        columns: [
          {
            prop: 'name',
            label: this.$t('assets.Name'),
            formatter: DetailFormatter,
            sortable: true,
            formatterArgs: {
              route: 'DomainDetail'
            }
          },
          {
            prop: 'asset_count',
            label: this.$t('assets.Assets')
          },
          {
            prop: 'gateway_count',
            label: this.$t('assets.Gateway')
          },
          {
            prop: 'comment',
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
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/domains/${id}/`
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
        createRoute: 'DomainCreate'
      },
      notice: this.$t('assets.DomainHelpMessage')
    }
  }
}
</script>

<style>

</style>
