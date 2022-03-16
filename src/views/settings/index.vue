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
import Basic from './Basic/index'
import Email from './Email/index'
import Auth from './Auth'
import Ldap from './Ldap'
import Terminal from './Terminal'
import Security from './Security/index'
import License from './License'
import Other from './Other.vue'
import Clean from './Clean'
import SysMessageSub from './Message'
import SMS from './SMS'

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
    Other,
    SysMessageSub,
    Clean,
    SMS
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
          title: this.$t('setting.MessageSub'),
          name: 'SysMessageSub'
        },
        {
          title: this.$t('setting.SMS'),
          name: 'SMS',
          hidden: () => {
            return !this.$store.getters.hasValidLicense
          }
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
          title: this.$t('setting.Cleaning'),
          name: 'Clean'
        },
        {
          title: this.$t('setting.Other'),
          name: 'Other'
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
      return this.$t('setting.setting')
    },
    componentData() {
      return {}
    }
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
