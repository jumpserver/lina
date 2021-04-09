<template>
  <div>
    <div>
      <TabPage :submenu="submenu" :active-menu.sync="activeMenu">
        <keep-alive>
          <component :is="activeMenu" :object="componentData" />
        </keep-alive>
      </TabPage>
    </div>

  </div>
</template>

<script>
import TabPage from '@/layout/components/TabPage'
import AutoDataForm from '@/components/AutoDataForm'
import IBox from '@/components/IBox'
import Basic from './Basic'
import Email from './Email'
import EmailContent from './EmailContent'
import Ldap from './Ldap'
import Terminal from './Terminal'
import Security from './Security'
import License from './License'
import Auth from './Auth'
export default {
  components: {
    IBox,
    TabPage,
    AutoDataForm,
    Basic,
    Email,
    EmailContent,
    Ldap,
    Terminal,
    Security,
    License,
    Auth
  },
  data() {
    return {
      activeMenu: 'Basic',
      settingsData: {},
      submenu: [
        {
          title: this.$t('setting.Basic'),
          name: 'Basic'
        },
        {
          title: this.$t('setting.Email'),
          name: 'Email'
        },
        {
          title: this.$t('setting.EmailContent'),
          name: 'EmailContent'
        },
        {
          title: this.$t('setting.Ldap'),
          name: 'Ldap'
        },
        {
          title: this.$t('setting.loginMethod'),
          name: 'Auth',
          has: this.$store.getters.publicSettings.AUTH_WECOM
        },
        {
          title: this.$t('setting.Terminal'),
          name: 'Terminal'
        },
        {
          title: this.$t('setting.Security'),
          name: 'Security'
        },
        {
          title: this.$t('setting.License'),
          name: 'License'
        }
      ]
    }
  },
  computed: {
    title() {
      return this.$t('settings.setting')
    },
    componentData() {
      return {}
    }
  },
  methods: {
    initial() {
      const params = this.$route.params
      switch (params.activeMenu) {
        case 'Basic':
          this.activeMenu = 'Basic'
          break
        case 'Email':
          this.activeMenu = 'Email'
          break
        case 'EmailContent':
          this.activeMenu = 'EmailContent'
          break
        case 'Ldap':
          this.activeMenu = 'Ldap'
          break
        case 'Terminal':
          this.activeMenu = 'Terminal'
          break
        case 'Security':
          this.activeMenu = 'Security'
          break
        case 'License':
          this.activeMenu = 'License'
          break
        case 'Auth':
          this.activeMenu = 'Auth'
          break
        default:
          this.activeMenu = 'Basic'
          break
      }
    }
  }
}
</script>

<style scoped>

</style>
