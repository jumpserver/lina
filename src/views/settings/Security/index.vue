<template>
  <TabPage :active-menu.sync="activeMenu" :submenu="submenu">
    <keep-alive>
      <component :is="activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage/index.vue'
import Auth from './Auth.vue'
import Password from './Password.vue'
import AuthLimit from './AuthLimit.vue'
import Session from './Session.vue'

export default {
  name: 'Index',
  components: { TabPage, Auth, Password, AuthLimit, Session },
  data() {
    return {
      activeMenu: 'Auth',
      submenu: [
        {
          title: this.$t('setting.AuthSecurity'),
          name: 'Auth'
        },
        {
          title: this.$t('setting.AuthLimit'),
          name: 'AuthLimit'
        },
        {
          title: this.$t('setting.PasswordSecurity'),
          name: 'Password'
        },
        {
          title: this.$t('setting.SessionSecurity'),
          name: 'Session'
        }
      ]
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
