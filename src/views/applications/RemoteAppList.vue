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
        url: '/api/v1/applications/remote-apps/',
        columns: [
          {
            prop: 'name',
            label: this.$t('applications.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'RemoteAppDetail'
          },
          {
            prop: 'get_type_display',
            label: this.$t('applications.appType')
          },
          {
            prop: 'asset_info.hostname',
            label: this.$t('applications.asset')
          },
          {
            prop: 'comment',
            label: this.$t('applications.comment'),
            sortable: 'custom'
          },
          {
            prop: 'id',
            label: this.$tc('Action'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              performDelete: ({row, col})=> {
                const id = row.id
                const url = `/api/v1/applications/remote-apps/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        ]
      },
      headerActions: {
        hasBulkDelete: false,
        createRoute: 'RemoteAppCreate'
      }
    }
  }
}
</script>

<style>

</style>
