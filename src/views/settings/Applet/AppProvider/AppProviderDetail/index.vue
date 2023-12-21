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
import Apps from './Apps.vue'
import Containers from './Containers'

export default {
  name: 'AppProviderDetail',
  components: {
    GenericDetailPage,
    Detail,
    Apps,
    TabPage,
    Containers
  },
  data() {
    return {
      host: {},
      config: {
        url: '/api/v1/terminal/app-providers',
        activeMenu: 'Detail',
        submenu: [
          {
            'title': this.$t('common.Detail'),
            'name': 'Detail'
          },
          {
            'title': this.$t('common.VirtualApps'),
            'name': 'Apps'
          },
          {
            'title': this.$t('terminal.Containers'),
            'name': 'Containers'
          }
        ],
        hasRightSide: true,
        actions: {
          hasDelete: false,
          hasUpdate: false,
          canDelete: this.$hasPerm('terminal.delete_virtualhost'),
          canUpdate: this.$hasPerm('terminal.change_virtualhost'),
          deleteSuccessRoute: 'Applets'
          // updateCallback: () => {
          //   this.$router.push({
          //     name: 'VirtualHostUpdate',
          //     params: { id: this.$route.params.id }
          //   })
          // }
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
