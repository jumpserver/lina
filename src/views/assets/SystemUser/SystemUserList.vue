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
        columns: ['name', 'username', 'username_same_with_user', 'protocol', 'login_mode', 'assets_amount', 'priority', 'date_created', 'comment', 'actions'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'username', 'protocol', 'login_mode', 'assets_amount', 'comment', 'actions']
        },
        columnsMeta: {
          username: {
            showOverflowTooltip: true
          },
          protocol: {
            width: '100px'
          },
          username_same_with_user: {
            width: '150px'
          },
          login_mode: {
            width: '120px'
          },
          assets_amount: {
            width: '80px'
          },
          actions: {
            formatterArgs: {
              hasClone: true
            }
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
