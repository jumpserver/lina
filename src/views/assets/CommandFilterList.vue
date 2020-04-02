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
            label: this.$t('assets.rules')
          },
          {
            prop: 'system_users',
            label: this.$t('assets.systemUser')
          },
          {
            prop: '',
            label: this.$t('assets.comment')
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
        createRoute: 'CommandFilterCreate'
      }
    }
  }
}
</script>

<style>

</style>
