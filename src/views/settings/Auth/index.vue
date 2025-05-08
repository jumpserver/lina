<template>
  <TabPage v-if="!loading" :active-menu.sync="activeMenu" :submenu="submenu">
    <keep-alive>
      <component :is="activeMenu" @update:tabs="updateActiveMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage'
import LdapHA from './Ldap/LdapHA.vue'
import LDAP from './Ldap/Ldap.vue'
import Base from './Base'
import Basic from './Basic'
import CAS from './CAS'
import OIDC from './OIDC'
import Radius from './Radius'
import DingTalk from './DingTalk'
import FeiShu from './FeiShu'
import Lark from './Lark'
import WeCom from './WeCom'
import SSO from './SSO'
import SAML2 from './SAML2'
import OAuth2 from './OAuth2'
import Passkey from './Passkey.vue'
import Slack from './Slack.vue'
import { authLocalStorage } from './const'

export default {
  components: {
    TabPage,
    LDAP,
    LdapHA,
    Base,
    Basic,
    CAS,
    OIDC,
    WeCom,
    DingTalk,
    FeiShu,
    Lark,
    Radius,
    SSO,
    SAML2,
    OAuth2,
    Passkey,
    Slack
  },
  data() {
    return {
      loading: true,
      activeMenu: 'Basic',
      defaultBackends: [
        {
          title: this.$t('Ldap'),
          name: 'LDAP',
          key: 'AUTH_LDAP'
        },
        {
          title: this.$t('CAS'),
          name: 'CAS',
          key: 'AUTH_CAS'
        },
        {
          title: this.$t('Passkey'),
          name: 'Passkey',
          key: 'AUTH_PASSKEY'
        }
      ],
      extraBackends: [
        {
          title: this.$t('OIDC'),
          name: 'OIDC',
          key: 'AUTH_OPENID'
        },
        {
          title: this.$t('SAML2'),
          name: 'SAML2',
          key: 'AUTH_SAML2'
        },
        {
          title: this.$t('OAuth2'),
          name: 'OAuth2',
          key: 'AUTH_OAUTH2'
        },
        {
          title: this.$t('WeCom'),
          name: 'WeCom',
          key: 'AUTH_WECOM'
        },
        {
          title: this.$t('DingTalk'),
          name: 'DingTalk',
          key: 'AUTH_DINGTALK'
        },
        {
          title: this.$t('FeiShu'),
          name: 'FeiShu',
          key: 'AUTH_FEISHU'
        },
        {
          title: 'Lark',
          name: 'Lark',
          key: 'AUTH_LARK'
        },
        {
          title: this.$t('Slack'),
          name: 'Slack',
          key: 'AUTH_SLACK'
        },
        {
          title: this.$t('Radius'),
          name: 'Radius',
          key: 'AUTH_RADIUS'
        }
      ],
      ldapHABackends: [
        {
          title: this.$t('LDAP HA'),
          name: 'LdapHA',
          key: 'AUTH_LDAP_HA'
        }
      ],
      submenu: []
    }
  },
  computed: {
    componentData() {
      return {}
    }
  },
  created() {
    this.filterAuthItems()
  },
  mounted() {
    this.$axios.get('/api/v1/settings/setting/?category=auth').then(res => {
      for (const item of this.submenu) {
        const key = item.key
        if (!key) {
          continue
        }
        if (res[key]) {
          item.icon = 'fa-check-circle text-primary'
        }
      }
    }).finally(() => {
      this.loading = false
    })
  },
  methods: {
    updateActiveMenu(key, status) {
      const targetTab =
        this.extraBackends.find((item) => item.key === key) ||
        this.ldapHABackends.find((item) => item.key === key) ||
        this.defaultBackends.find((item) => item.key === key)

      status ? this.submenu.push(targetTab) : this.submenu.splice(this.submenu.indexOf(targetTab), 1)
    },
    filterAuthItems() {
      const authItems = authLocalStorage.get('authItems')

      const defaultBackends = this.defaultBackends.filter((defaultItem) => {
        const authItem = authItems.find((item) => item.enabled && item.authKey === defaultItem.key)

        return authItem
      })
      const ldapHABackends = this.ldapHABackends.filter((ldapHABackendItem) => {
        const authItem = authItems.find((item) => item.enabled && item.authKey === ldapHABackendItem.key)

        return authItem
      })
      const extraBackends = this.extraBackends.filter((extraItem) => {
        const authItem = authItems.find((item) => item.enabled && item.authKey === extraItem.key)

        return authItem
      })

      this.submenu = [
        {
          title: this.$t('Basic'),
          name: 'Basic'
        },
        ...defaultBackends,
        ...ldapHABackends,
        ...extraBackends
      ]
    }
  }
}
</script>

<style lang='scss' scoped>
::v-deep .el-tabs__item .fa {
  font-size: 11px;
}

</style>
