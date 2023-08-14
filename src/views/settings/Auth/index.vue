<template>
  <TabPage :active-menu.sync="activeMenu" :submenu="submenu">
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
import WeCom from './WeCom'
import SSO from './SSO'
import SAML2 from './SAML2'
import OAuth2 from './OAuth2'

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
    Radius,
    SSO,
    SAML2,
    OAuth2
  },
  data() {
    let extraBackends = []
    if (this.$store.getters.hasValidLicense) {
      extraBackends = [
        {
          title: this.$t('setting.OIDC'),
          name: 'OIDC'
        },
        {
          title: this.$t('setting.SAML2'),
          name: 'SAML2'
        },
        {
          title: this.$t('setting.OAuth2'),
          name: 'OAuth2'
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
          title: this.$t('setting.Radius'),
          name: 'Radius'
        },
        {
          title: this.$t('setting.SSO'),
          name: 'SSO'
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
          name: 'LDAP'
        },
        {
          title: this.$t('setting.CAS'),
          name: 'CAS'
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
  },
  methods: {}
}
</script>

<style scoped>

</style>
