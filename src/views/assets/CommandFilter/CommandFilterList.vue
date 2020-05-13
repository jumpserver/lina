<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="title" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, ActionsFormatter, DetailLengthFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/cmd-filters/',
        columns: [
          {
            prop: 'name',
            label: this.$t('assets.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'CommandFilterDetail'
          },
          {
            prop: 'rules',
            label: this.$t('assets.rules'),
            formatter: DetailLengthFormatter,
            route: 'CommandFilterDetail'
          },
          {
            prop: 'system_users',
            label: this.$t('assets.systemUser'),
            formatter: DetailLengthFormatter,
            route: 'CommandFilterDetail'
          },
          {
            prop: 'comment',
            label: this.$t('assets.comment'),
            sortable: 'custom'
          },
          {
            prop: 'id',
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/cmd-filters/${id}/`
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
        hasRefresh: true,
        hasBulkDelete: false,
        hasSearch: true,
        createRoute: 'CommandFilterCreate'
      }
    }
  },
  computed: {
    title() {
      return this.$t('assets.CommandFilterHelpMessage')
    }
  }
}
</script>

<style>

</style>
