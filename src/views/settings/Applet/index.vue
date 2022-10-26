<template>
  <TabPage :submenu="submenu" :active-menu.sync="activeMenu">
    <keep-alive>
      <component :is="activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import Applets from './Applets/AppletList'
import AppletHosts from './AppletHosts'
export default {
  name: 'Applet',
  components: {
    TabPage,
    Applets,
    AppletHosts
  },
  data() {
    return {
      activeMenu: 'Applets',
      submenu: [
        {
          title: this.$t('terminal.Applets'),
          name: 'Applets'
        },
        {
          title: this.$t('terminal.AppletHosts'),
          name: 'AppletHosts'
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
