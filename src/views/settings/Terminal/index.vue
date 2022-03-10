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

export default {
  components: {
    TabPage,
    Basic,
    Monitor,
    TerminalList,
    ReplayStorage,
    CommandStorage
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
          hidden: () => !this.$hasPerm('terminal.view_terminal')
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
