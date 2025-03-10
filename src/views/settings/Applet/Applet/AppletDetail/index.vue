<template>
  <GenericDetailPage
    :active-menu.sync="config.activeMenu"
    :object.sync="applet"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="applet" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail'
import AppletHosts from './AppletHosts'

export default {
  name: 'AppletDetail',
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    AppletHosts
  },
  data() {
    return {
      applet: {},
      config: {
        url: '/api/v1/terminal/applets',
        activeMenu: 'Detail',
        submenu: [
          {
            'title': this.$t('Basic'),
            'name': 'Detail'
          },
          {
            'title': this.$t('AppletHosts'),
            'name': 'AppletHosts',
            hidden: !this.$hasPerm('terminal.view_appletpublication')
          }
        ],
        hasRightSide: true,
        actions: {
          hasUpdate: false,
          canDelete: () => {
            return this.$hasPerm('terminal.delete_applet')
          },
          deleteSuccessRoute: 'Applets'
        },
        titlePrefix: this.$tc('AppletDetail')
      }
    }
  }
}
</script>
