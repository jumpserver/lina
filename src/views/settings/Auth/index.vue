<template>
  <TabPage v-if="!loading" :active-menu.sync="activeMenu" :submenu="menu">
    <keep-alive>
      <component :is="activeMenu" />
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
import { getAuthItems } from './const'
import { mapState } from 'vuex'

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
      authMethods: [],
      submenu: []
    }
  },
  computed: {
    ...mapState({
      authMethodsSetting: state => state.settings.authMethods
    }),
    menu() {
      return [
        {
          title: this.$t('Basic'),
          name: 'Basic'
        },
        ...this.authMethods.map(item => {
          return {
            ...item,
            hidden: () => !this.authMethodsSetting[item.authKey]
          }
        })
      ]
    }
  },
  created() {
    this.$store.dispatch('settings/getAuthMethods').then()
  },
  async mounted() {
    this.authMethods = await getAuthItems()
    this.loading = false
  }
}
</script>

<style lang='scss' scoped>
::v-deep .el-tabs__item .fa {
  font-size: 11px;
}

</style>
