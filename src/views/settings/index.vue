<template>
  <div>
    <TabPage :submenu="submenu" :active-menu.sync="activeMenu">
      <keep-alive>
        <component :is="activeMenu" :object="componentData" />
      </keep-alive>
    </TabPage>
  </div>
</template>

<script>
import TabPage from '@/layout/components/TabPage'
import AutoDataForm from '@/components/AutoDataForm'
import IBox from '@/components/IBox'
import Basic from './Basic'
import { Email } from './Email/index'
import Auth from './Auth'
import Ldap from './Ldap'
import Terminal from './Terminal'
import Security from './Security'
import License from './License'
import WeCom from './WeCom'
import DingTalk from './DingTalk'
import FeiShu from './FeiShu.vue'
import Advanced from './Advanced.vue'
import SystemMessageSubscription from './SystemMessageSubscription/Subscription'

export default {
  components: {
    IBox,
    TabPage,
    AutoDataForm,
    Basic,
    Email,
    Ldap,
    Auth,
    Terminal,
    Security,
    License,
    WeCom,
    DingTalk,
    FeiShu,
    Advanced,
    SystemMessageSubscription
  },
  data() {
    return {
      loading: true,
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
          title: this.$t('setting.Ldap'),
          name: 'Ldap'
        },
        {
          title: this.$t('setting.Auth'),
          name: 'Auth'
        },
        {
          title: this.$t('setting.WeCom'),
          name: 'WeCom'
        },
        {
          title: this.$t('setting.DingTalk'),
          name: 'DingTalk'
        },
        {
          title: this.$t('setting.FeiShu'),
          name: 'FeiShu'
        },
        {
          title: this.$t('setting.SystemMessageSubscription'),
          name: 'SystemMessageSubscription'
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
        },
        {
          title: this.$t('setting.Advanced'),
          name: 'Advanced'
        }
      ]
    }
  },
  computed: {
    title() {
      return this.$t('setting.setting')
    },
    componentData() {
      return {}
    }
  },
  mounted() {
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
        case 'SystemMessageSubscription':
          this.activeMenu = 'SystemMessageSubscription'
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
