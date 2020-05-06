<template>
  <div v-if="!loading">
    <TabPage :submenu="submenu" :active-menu.sync="activeMenu">
      <IBox>
        <keep-alive>
          <component :is="activeMenu" :object="componentData" />
        </keep-alive>
      </IBox>
    </TabPage>
  </div>
</template>

<script>
import { TabPage } from '@/layout/components'
import { AutoDataForm } from '@/components'
import { IBox } from '@/components'
import Basic from './Basic'
import Email from './Email'
import EmailContent from './EmailContent'
import Ldap from './Ldap'
import Terminal from './Terminal'
import Security from './Security'
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
    Security
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
      }
    },
    basicData(data) {
      return data.basic
    },
    emailData(data) {
      return data.email
    },
    emailContentData(data) {
      return data.email_content
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
