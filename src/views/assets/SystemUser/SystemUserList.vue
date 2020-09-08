<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="helpMessage" />
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
            label: this.$t('common.Name'),
            formatter: DetailFormatter,
            showOverflowTooltip: true,
            sortable: true,
            formatterArgs: {
              route: 'SystemUserDetail'
            }
          },
          {
            prop: 'username',
            label: this.$t('common.Username'),
            showOverflowTooltip: true,
            sortable: 'custom'
          },
          {
            prop: 'protocol',
            label: this.$t('assets.Protocol'),
            sortable: 'custom',
            width: '100px'
          },
          {
            prop: 'login_mode_display',
            label: this.$t('assets.LoginModel'),
            width: '120px'
          },
          {
            prop: 'assets_amount',
            label: this.$t('assets.Assets'),
            width: '80px'
          },
          {
            prop: 'comment',
            showOverflowTooltip: true,
            label: this.$t('common.Comment')
          },
          {
            prop: 'id',
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            label: this.$t('common.Action'),
            updateRoute: 'SystemUserUpdate',
            formatterArgs: {
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/system-users/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        ]
      },
      headerActions: {
        hasBulkDelete: false,
        hasMoreActions: false,
        createRoute: 'SystemUserCreate'
      },
      helpMessage: this.$t('assets.SystemUserListHelpMessage')
    }
  }
}
</script>

<style>

</style>
