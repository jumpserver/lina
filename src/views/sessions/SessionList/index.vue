<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu">
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
import OnlineList from './OnlineList'
import OfflineList from './OfflineList'
export default {
  name: 'Index',
  components: {
    TabPage,
    OnlineList,
    OfflineList
  },
  data() {
    return {
      config: {
        activeMenu: 'OnlineList',
        submenu: [
          {
            title: this.$t('route.SessionOnline'),
            name: 'OnlineList'
          },
          {
            title: this.$t('route.SessionOffline'),
            name: 'OfflineList'
          }
        ]
      }
    }
  },
  computed: {
    Title() {
      return this.$t('route.Sessions')
    }
  },
  mounted() {
    const params = this.$route.params
    switch (params.activeMenu) {
      case 'OnlineList':
        this.config.activeMenu = 'OnlineList'
        break
      case 'OfflineList':
        this.config.activeMenu = 'OfflineList'
        break
    }
  }
}
</script>

<style scoped>

</style>
