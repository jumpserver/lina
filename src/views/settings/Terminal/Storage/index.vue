<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu" v-on="$listeners">
    <div slot="title">
      {{ Title }}
    </div>
    <keep-alive>
      <component :is="config.activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import ReplayStorage from './ReplayStorage'
import CommandStorage from './CommandStorage'
export default {
  name: 'Storage',
  components: {
    TabPage,
    ReplayStorage,
    CommandStorage
  },
  data() {
    return {
      config: {
        activeMenu: 'ReplayStorage',
        submenu: [
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
    }
  },
  computed: {
    Title() {
      return this.$t('sessions.storage')
    }
  },
  mounted() {
    const params = this.$route.params
    switch (params.activeMenu) {
      case 'ReplayStorage':
        this.config.activeMenu = 'ReplayStorage'
        break
      case 'CommandStorage':
        this.config.activeMenu = 'CommandStorage'
        break
    }
  }

}
</script>

<style scoped>

</style>
