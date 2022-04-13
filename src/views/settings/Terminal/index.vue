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
import TerminalList from './TerminalList'
import ReplayStorage from './Storage/ReplayStorage'
import CommandStorage from './Storage/CommandStorage'
import Monitor from './Monitor'
import EndpointList from './Endpoint/EndpointList'
import EndpointRuleList from './EndpointRule/EndpointRuleList'

export default {
  components: {
    TabPage,
    Basic,
    Monitor,
    TerminalList,
    ReplayStorage,
    CommandStorage,
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
          title: this.$t('sessions.replayStorage'),
          name: 'ReplayStorage',
          hidden: () => !this.$hasPerm('terminal.view_replaystorage')
        },
        {
          title: this.$t('sessions.commandStorage'),
          name: 'CommandStorage',
          hidden: () => !this.$hasPerm('terminal.view_commandstorage')
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
  }
}
</script>

<style scoped>

</style>
