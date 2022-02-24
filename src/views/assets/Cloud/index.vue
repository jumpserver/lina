<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu">
    <keep-alive>
      <component :is="config.activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import AccountList from './Account/AccountList'
import SyncInstanceTaskList from './SyncInstanceTask/SyncInstanceTaskList'
export default {
  name: 'Index',
  components: {
    TabPage,
    AccountList,
    SyncInstanceTaskList
  },
  data() {
    return {
      config: {
        activeMenu: 'SyncInstanceTaskList',
        submenu: [
          {
            title: this.$t('xpack.Cloud.SyncInstanceTaskList'),
            name: 'SyncInstanceTaskList'
          },
          {
            title: this.$t('xpack.Cloud.AccountList'),
            name: 'AccountList'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
