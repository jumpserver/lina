<template>
  <GenericDetailPage
    :object.sync="applet"
    :active-menu.sync="config.activeMenu"
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

export default {
  name: 'AppletDetail',
  components: {
    GenericDetailPage,
    TabPage,
    Detail
  },
  data() {
    return {
      applet: {},
      config: {
        url: '/api/v1/terminal/applets',
        activeMenu: 'Detail',
        submenu: [
          {
            'title': this.$t('common.Detail'),
            'name': 'Detail'
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
        titlePrefix: this.$tc('route.AppletDetail')
      }
    }
  },
  mounted() {}
}
</script>

<style scoped>

</style>
