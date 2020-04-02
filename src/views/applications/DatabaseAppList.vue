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
        url: '/api/v1/applications/database-apps/',
        columns: [
          {
            prop: 'name',
            label: this.$t('applications.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'DatabaseAppDetail'
          },
          {
            prop: 'get_type_display',
            label: this.$t('applications.appType')
          },
          {
            prop: 'host',
            label: this.$t('applications.host')
          },
          {
            prop: 'port',
            label: this.$t('applications.port')
          },
          {
            prop: 'database',
            label: this.$t('applications.database')
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
        createRoute: 'DatabaseAppCreate'
      }
    }
  }
}
</script>

<style>

</style>
