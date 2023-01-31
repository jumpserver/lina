<template>
  <GenericDetailPage
    :object.sync="host"
    :active-menu.sync="config.activeMenu"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="host" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail'
import Applets from './Applets'
import Accounts from './Accounts'
import Developments from './Devployments'

export default {
  name: 'AssetHostDetail',
  components: {
    GenericDetailPage,
    Applets,
    TabPage,
    Detail,
    Accounts,
    Developments
  },
  data() {
    return {
      host: {},
      config: {
        url: '/api/v1/terminal/applet-hosts',
        activeMenu: 'Detail',
        submenu: [
          {
            'title': this.$t('common.Detail'),
            'name': 'Detail'
          },
          {
            title: this.$t('assets.Accounts'),
            name: 'Accounts'
          },
          {
            'title': this.$t('terminal.Applets'),
            'name': 'Applets'
          },
          {
            'title': this.$t('terminal.HostDeployment'),
            'name': 'Developments'
          }
        ],
        hasRightSide: true,
        actions: {
          canDelete: this.$hasPerm('terminal.delete_applethost'),
          canUpdate: this.$hasPerm('terminal.change_applethost'),
          deleteSuccessRoute: 'Applets',
          updateCallback: () => {
            this.$router.push({
              name: 'Applets',
              params: { id: this.$route.params.id },
              query: { platform: this.host.platform.id }
            })
          }
        }
      }
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
