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

export default {
  components: {
    TabPage,
    Basic,
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
          name: 'TerminalList'
        },
        {
          title: this.$t('sessions.replayStorage'),
          name: 'ReplayStorage'
        },
        {
          title: this.$t('sessions.commandStorage'),
          name: 'CommandStorage'
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
