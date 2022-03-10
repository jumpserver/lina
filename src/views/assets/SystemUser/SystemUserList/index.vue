<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu">
    <keep-alive>
      <component :is="config.activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import CommonUserList from './CommonUserList'
import AdminUserList from './AdminUserList'
export default {
  name: 'Index',
  components: {
    TabPage,
    CommonUserList,
    AdminUserList
  },
  data() {
    return {
      config: {
        activeMenu: 'CommonUserList',
        submenu: [
          {
            title: this.$t('assets.CommonUser'),
            name: 'CommonUserList',
            hidden: () => !this.$hasPerm('assets.view_systemuser')
          },
          {
            title: this.$t('assets.AdminUser'),
            name: 'AdminUserList',
            hidden: () => !this.$hasPerm('assets.view_systemuser')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
