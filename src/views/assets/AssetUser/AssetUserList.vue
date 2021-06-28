<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu">
    <keep-alive>
      <component :is="config.activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import SystemUserList from './SystemUser/SystemUserList'
import AdminUserList from './AdminUser/AdminUserList'
export default {
  name: 'Index',
  components: {
    TabPage,
    SystemUserList,
    AdminUserList
  },
  data() {
    return {
      config: {
        activeMenu: 'SystemUserList',
        submenu: [
          {
            title: this.$t('assets.SystemUser'),
            name: 'SystemUserList'
          },
          {
            title: this.$t('route.AdminUserList'),
            name: 'AdminUserList'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
