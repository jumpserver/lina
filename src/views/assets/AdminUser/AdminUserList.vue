<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="helpMessage" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/admin-users/',
        columns: ['name', 'username', 'assets_amount', 'comment', 'actions'],
        columnsMeta: {
          username: {
            showOverflowTooltip: true
          },
          assets_amount: {
            width: '80px'
          }
        }
      },
      updateRoute: 'AdminUserUpdate',
      headerActions: {
        createRoute: 'AdminUserCreate'
      },
      helpMessage: this.$t('assets.AdminUserListHelpMessage')
    }
  }
}
</script>

<style>

</style>
