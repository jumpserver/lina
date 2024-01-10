<template>
  <TabPage :active-menu.sync="activeMenu" :submenu="submenu">
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
          title: this.$t('Applets'),
          name: 'Applets'
        },
        {
          title: this.$t('AppletHosts'),
          name: 'AppletHosts',
          hidden: () => !this.$hasPerm('terminal.view_applethost')
        },
        {
          title: this.$t('VirtualApp'),
          name: 'VirtualApp',
          hidden: () => {
            return !store.getters.publicSettings['VIRTUAL_APP_ENABLED'] || !this.$store.getters.hasValidLicense
          }
        },
        {
          title: this.$t('AppProvider'),
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
