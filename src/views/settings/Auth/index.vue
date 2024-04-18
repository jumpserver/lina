<template>
  <TabPage v-if="!loading" :active-menu.sync="activeMenu" :submenu="submenu">
    <keep-alive>
      <component :is="activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage'
import LDAP from './Ldap'
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

export default {
  components: {
    TabPage,
    LDAP,
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
    let extraBackends = []
    if (this.$store.getters.hasValidLicense) {
      extraBackends = [
        {
          title: this.$t('setting.OIDC'),
          name: 'OIDC',
          key: 'AUTH_OPENID'
        },
        {
          title: this.$t('setting.SAML2'),
          name: 'SAML2',
          key: 'AUTH_SAML2'
        },
        {
          title: this.$t('setting.OAuth2'),
          name: 'OAuth2',
          key: 'AUTH_OAUTH2'
        },
        {
          title: this.$t('setting.WeCom'),
          name: 'WeCom',
          key: 'AUTH_WECOM'
        },
        {
          title: this.$t('setting.DingTalk'),
          name: 'DingTalk',
          key: 'AUTH_DINGTALK'
        },
        {
          title: this.$t('setting.FeiShu'),
          name: 'FeiShu',
          key: 'AUTH_FEISHU'
        },
        {
          title: 'Lark',
          name: 'Lark',
          key: 'AUTH_LARK'
        },
        {
          title: this.$t('setting.Slack'),
          name: 'Slack',
          key: 'AUTH_SLACK'
        },
        {
          title: this.$t('setting.Radius'),
          name: 'Radius',
          key: 'AUTH_RADIUS'
        }
      ]
    }
    return {
      loading: true,
      activeMenu: 'Basic',
      submenu: [
        {
          title: this.$t('common.Basic'),
          name: 'Basic'
        },
        {
          title: this.$t('setting.Ldap'),
          name: 'LDAP',
          key: 'AUTH_LDAP'
        },
        {
          title: this.$t('setting.CAS'),
          name: 'CAS',
          key: 'AUTH_CAS'
        },
        {
          title: this.$t('setting.Passkey'),
          name: 'Passkey',
          key: 'AUTH_PASSKEY'
        },
        ...extraBackends
      ]
    }
  },
  computed: {
    componentData() {
      return {}
    }
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
  methods: {}
}
</script>

<style lang='scss' scoped>
>>> .el-tabs__item .fa {
  font-size: 11px;
}

</style>
