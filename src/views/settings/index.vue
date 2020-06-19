<template>
  <div v-if="!loading">
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
import Email from './Email'
import EmailContent from './EmailContent'
import Ldap from './Ldap'
import Terminal from './Terminal'
import Security from './Security'
import License from './License'
import { getSettings } from '@/api/settings'
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
    License
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
          title: this.$t('setting.EmailContent'),
          name: 'EmailContent'
        },
        {
          title: this.$t('setting.Ldap'),
          name: 'Ldap'
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
    Title() {
      return this.$t('settings.setting')
    },
    componentData() {
      switch (this.activeMenu) {
        case 'Basic':
          return this.basicData(this.settingsData)
        case 'Email':
          return this.emailData(this.settingsData)
        case 'EmailContent':
          return this.emailContentData(this.settingsData)
        case 'Ldap':
          return this.ldapData(this.settingsData)
        case 'Terminal':
          return this.terminalData(this.settingsData)
        case 'Security':
          return this.securityData(this.settingsData)
        case 'License':
          return {}
      }
      return this.basicData(this.settingsData)
    }

  },
  mounted() {
    getSettings().then(data => {
      this.settingsData = data
      this.initial()
      this.loading = false
    })
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
      }
    },
    basicData(data) {
      const basic = data.basic
      if (basic.SITE_URL === null) {
        basic.SITE_URL = ''
      }
      if (basic.EMAIL_SUBJECT_PREFIX === null) {
        basic.EMAIL_SUBJECT_PREFIX = ''
      }
      if (basic.USER_GUIDE_URL === null) {
        basic.USER_GUIDE_URL = ''
      }
      return basic
    },
    emailData(data) {
      const email = data.email
      if (email.EMAIL_FROM === null) {
        email.EMAIL_FROM = ''
      }
      if (email.EMAIL_RECIPIENT === null) {
        email.EMAIL_RECIPIENT = ''
      }
      if (email.EMAIL_USE_TLS === null) {
        email.EMAIL_USE_TLS = false
      }
      if (email.EMAIL_HOST === null) {
        email.EMAIL_HOST = ''
      }
      if (email.EMAIL_HOST_USER === null) {
        email.EMAIL_HOST_USER = ''
      }
      if (email.EMAIL_PORT === null) {
        email.EMAIL_PORT = ''
      }
      if (email.EMAIL_USE_SSL === null) {
        email.EMAIL_USE_SSL = false
      }
      return email
    },
    emailContentData(data) {
      const email_content = data.email_content
      if (email_content.EMAIL_CUSTOM_USER_CREATED_BODY === null) {
        email_content.EMAIL_CUSTOM_USER_CREATED_BODY = ''
      }
      if (email_content.EMAIL_CUSTOM_USER_CREATED_HONORIFIC === null) {
        email_content.EMAIL_CUSTOM_USER_CREATED_HONORIFIC = ''
      }
      if (email_content.EMAIL_CUSTOM_USER_CREATED_SIGNATURE === null) {
        email_content.EMAIL_CUSTOM_USER_CREATED_SIGNATURE = ''
      }
      if (email_content.EMAIL_CUSTOM_USER_CREATED_SUBJECT === null) {
        email_content.EMAIL_CUSTOM_USER_CREATED_SUBJECT = ''
      }
      return email_content
    },
    ldapData(data) {
      return data.ldap
    },
    terminalData(data) {
      return data.terminal
    },
    securityData(data) {
      return data.security
    }
  }
}
</script>

<style scoped>

</style>
