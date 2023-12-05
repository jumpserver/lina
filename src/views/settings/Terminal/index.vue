<template>
  <TabPage :submenu="submenu" :active-menu.sync="activeMenu">
    <keep-alive>
      <component :is="activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage'
import Basic from './Base'
import TerminalList from './Component/TerminalList'
import Monitor from './Monitor'
import EndpointList from './Endpoint/EndpointList'
import EndpointRuleList from './EndpointRule/EndpointRuleList'

export default {
  components: {
    TabPage,
    Basic,
    Monitor,
    TerminalList,
    EndpointList,
    EndpointRuleList
  },
  data() {
    return {
      loading: true,
      activeMenu: 'Basic',
      submenu: [
        {
          title: this.$t('setting.Basic'),
          name: 'Basic'
        },
        {
          title: this.$t('route.Terminal'),
          name: 'TerminalList',
          hidden: () => !this.$hasPerm('terminal.view_terminal')
        },
        {
          title: this.$t('xpack.ComponentMonitor'),
          name: 'Monitor',
          hidden: () => {
            return !(this.$hasPerm('terminal.view_status') && this.$store.getters.hasValidLicense)
          }
        },
        {
          title: this.$t('xpack.Endpoint'),
          name: 'EndpointList',
          hidden: () => {
            return !this.$hasPerm('terminal.view_endpoint')
          }
        },
        {
          title: this.$t('xpack.EndpointRule'),
          name: 'EndpointRuleList',
          hidden: () => {
            return !this.$hasPerm('terminal.view_endpointrule')
          }
        }
      ]
    }
  },
  computed: {
    componentData() {
      return {}
    }
  },
  beforeRouteUpdate(to, from, next) {
    if (to.name === from.name && to.path === from.path && to.query?.activeTab) {
      this.$store.commit('common/reload')
    }
    next()
  }
}
</script>

<style scoped>

</style>
