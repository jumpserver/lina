<template>
  <TabPage :submenu="submenu" :active-menu.sync="activeMenu">
    <keep-alive>
      <component :is="activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage'
import ReplayStorage from './ReplayStorage.vue'
import CommandStorage from './CommandStorage.vue'

export default {
  components: {
    TabPage,
    ReplayStorage,
    CommandStorage
  },
  data() {
    return {
      loading: true,
      activeMenu: 'ReplayStorage',
      submenu: [
        {
          title: this.$t('sessions.objectStorage'),
          name: 'ReplayStorage',
          hidden: () => !this.$hasPerm('terminal.view_replaystorage')
        },
        {
          title: this.$t('sessions.commandStorage'),
          name: 'CommandStorage',
          hidden: () => !this.$hasPerm('terminal.view_commandstorage')
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
