<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="TaskDetail" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail'
import TaskExecutionList from './TaskExecutionList'

export default {
  name: 'AccountGatherTaskDetail',
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    TaskExecutionList
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        url: '/api/v1/accounts/gather-account-automations',
        activeMenu: 'Detail',
        titlePrefix: this.$t('AccountGatherDetail'),
        actions: {
          deleteSuccessRoute: 'AccountGatherList',
          canUpdate: this.$hasPerm('accounts.change_gatheraccountsautomation'),
          canDelete: this.$hasPerm('accounts.delete_gatheraccountsautomation')
        },
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'Detail'
          }
        ],
        hasRightSide: true
      }
    }
  }
}
</script>

<style scoped>

</style>
