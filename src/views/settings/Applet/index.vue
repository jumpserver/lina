<template>
  <TabPage :submenu="submenu" :active-menu.sync="activeMenu">
    <keep-alive>
      <component :is="activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import Applets from './Applet/AppletList'
import AppletHosts from './AppletHost/AppletHostList'
import VirtualApp from './VirtualApp/VirtualAppList'
import AppProvider from './AppProvider/AppProviderList'
import store from '@/store'
export default {
  name: 'Applet',
  components: {
    TabPage,
    Applets,
    AppletHosts,
    VirtualApp,
    AppProvider
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
          name: 'AppletHosts',
          hidden: () => !this.$hasPerm('terminal.view_applethost')
        },
        {
          title: this.$t('terminal.VirtualApp'),
          name: 'VirtualApp',
          hidden: () => {
            return !store.getters.publicSettings['VIRTUAL_APP_ENABLED'] || !this.$store.getters.hasValidLicense
          }
        },
        {
          title: this.$t('terminal.AppProvider'),
          name: 'AppProvider',
          hidden: () => {
            return !store.getters.publicSettings['VIRTUAL_APP_ENABLED'] || !this.$store.getters.hasValidLicense
          }
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
