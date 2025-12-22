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
import ComponentLog from '@/views/settings/Terminal/ComponentLog/ComponentLog.vue'

export default {
  components: {
    TabPage,
    Basic,
    Monitor,
    TerminalList,
    EndpointList,
    EndpointRuleList,
    ComponentLog
  },
  beforeRouteUpdate(to, from, next) {
    if (to.name === from.name && to.path === from.path && to.query?.tab) {
      this.$store.commit('common/reload')
    }
    next()
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
          title: this.$t('Components'),
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
          title: this.$t('Endpoints'),
          name: 'EndpointList',
          hidden: () => {
            return !this.$hasPerm('terminal.view_endpoint')
          }
        },
        {
          title: this.$t('EndpointRules'),
          name: 'EndpointRuleList',
          hidden: () => {
            return !this.$hasPerm('terminal.view_endpointrule')
          }
        },
        {
          title: this.$t('Log'),
          name: 'ComponentLog',
          hidden: () => {
            return !this.$store.getters.publicSettings['LOKI_LOG_ENABLED']
          }
        }
      ]
    }
  },
  computed: {
    componentData() {
      return {}
    }
  }
}
</script>

<style scoped>

</style>
