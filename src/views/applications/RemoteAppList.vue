<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import DetailFormatter from '@/components/DataTable/formatters/DetailFormatter'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      showTree: true,
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
            prop: 'asset_info',
            label: this.$t('applications.asset')
          },
          {
            prop: 'comment',
            label: this.$t('applications.comment')
          }
        ],
        tableActions: {
          hasEdit: true,
          editRoute: '404'
        }
      },
      headerActions: {
        hasDelete: false,
        hasUpdate: false,
        createRoute: 'RemoteAppCreate'
      }
    }
  }
}
</script>

<style>

</style>
