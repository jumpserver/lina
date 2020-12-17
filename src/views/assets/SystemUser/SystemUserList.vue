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
        url: '/api/v1/assets/system-users/',
        columns: ['name', 'username', 'protocol', 'login_mode', 'assets_amount', 'comment', 'actions'],
        columnsMeta: {
          username: {
            showOverflowTooltip: true
          },
          protocol: {
            width: '100px'
          },
          login_mode: {
            width: '120px'
          },
          assets_amount: {
            width: '80px'
          }
        }
      },
      headerActions: {
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
