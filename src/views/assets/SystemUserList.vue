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
        url: '/api/v1/assets/system-users/',
        columns: [
          {
            prop: 'name',
            label: this.$t('common.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'SystemUserDetail'
          },
          {
            prop: 'username',
            label: this.$t('common.username'),
            sortable: 'custom'
          },
          {
            prop: 'protocol',
            label: this.$t('assets.protocol'),
            sortable: 'custom'
          },
          {
            prop: 'login_mode_display',
            label: this.$t('assets.loginMode'),
            sortable: 'custom'
          },
          {
            prop: 'assets_amount',
            label: this.$t('assets.asset'),
            sortable: 'custom'
          },
          {
            prop: 'comment',
            label: this.$t('assets.comment'),
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
                const url = `/api/v1/assets/system-users/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        ]
      },
      headerActions: {
        // hasBulkDelete: false,
        createRoute: 'SystemUserCreate'
      }
    }
  }
}
</script>

<style>

</style>
