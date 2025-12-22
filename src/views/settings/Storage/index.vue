<template>
  <TabPage :active-menu.sync="activeMenu" :submenu="submenu">
    <keep-alive>
      <component :is="activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage'
import ReplayStorage from './ObjectStorage.vue'
import CommandStorage from './CommandStorage.vue'

export default {
  components: {
    TabPage,
    ReplayStorage,
    CommandStorage
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
      activeMenu: 'ReplayStorage',
      submenu: [
        {
          title: this.$t('ObjectStorage'),
          name: 'ReplayStorage',
          hidden: () => !this.$hasPerm('terminal.view_replaystorage')
        },
        {
          title: this.$t('CommandStorage'),
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
  }
}
</script>
