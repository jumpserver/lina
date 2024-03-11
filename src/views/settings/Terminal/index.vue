<template>
  <TabPage :active-menu.sync="activeMenu" :submenu="submenu">
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
          title: this.$t('Basic'),
          name: 'Basic'
        },
        {
          title: this.$t('Terminal'),
          name: 'TerminalList',
          hidden: () => !this.$hasPerm('terminal.view_terminal')
        },
        {
          title: this.$t('ComponentMonitor'),
          name: 'Monitor',
          hidden: () => {
            return !(this.$hasPerm('terminal.view_status') && this.$store.getters.hasValidLicense)
          }
        },
        {
          title: this.$t('Endpoint'),
          name: 'EndpointList',
          hidden: () => {
            return !this.$hasPerm('terminal.view_endpoint')
          }
        },
        {
          title: this.$t('EndpointRule'),
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
    if (to.name === from.name && to.path === from.path && to.query?.tab) {
      this.$store.commit('common/reload')
    }
    next()
  }
}
</script>

<style scoped>

</style>
