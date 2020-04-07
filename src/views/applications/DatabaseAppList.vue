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
            label: this.$t('applications.appType'),
            sortable: 'custom'
          },
          {
            prop: 'host',
            label: this.$t('applications.host'),
            sortable: 'custom'
          },
          {
            prop: 'port',
            label: this.$t('applications.port'),
            sortable: 'custom'
          },
          {
            prop: 'database',
            label: this.$t('applications.database'),
            sortable: 'custom'
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
                const url = `/api/v1/applications/database-apps/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        ],
        tableActions: {
          hasEdit: true,
          editRoute: '404'
        }
      },
      headerActions: {
        hasBulkDelete: false,
        createRoute: 'DatabaseAppCreate'
      }
    }
  }
}
</script>

<style>

</style>
