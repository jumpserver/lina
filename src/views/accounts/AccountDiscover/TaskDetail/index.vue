<template>
  <GenericDetailPage
    v-bind="config"
    v-model:active-menu="config.activeMenu"
    v-model:object="TaskDetail"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import TaskExecutionList from '../AccountDiscoverExecutionList.vue'
import Detail from './Detail.vue'

export default {
  name: 'AccountDiscoverTaskDetail',
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
        titlePrefix: this.$t('AccountDiscoverDetail'),
        actions: {
          deleteSuccessRoute: 'AccountDiscoverList',
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

<style scoped></style>
