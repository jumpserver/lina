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
        url: '/api/v1/assets/admin-users/',
        columns: [
          {
            prop: 'name',
            label: this.$t('common.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'AdminUserDetail'
          },
          {
            prop: 'username',
            label: this.$t('common.username')
          },
          {
            prop: 'assets',
            label: this.$t('assets.asset')
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
        createRoute: 'AdminUserCreate'
      }
    }
  }
}
</script>

<style>

</style>
