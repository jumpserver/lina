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
            label: this.$t('assets.BasePlatform')
          },
          {
            prop: 'comment',
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
        createRoute: 'PlatformCreate'
      }
    }
  }
}
</script>

<style>

</style>
