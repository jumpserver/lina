<template>
  <GenericDetailPage
    :object.sync="asset"
    :active-menu.sync="config.activeMenu"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="asset" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail'

export default {
  name: 'AssetListDetail',
  components: {
    GenericDetailPage,
    TabPage,
    Detail
  },
  data() {
    return {
      asset: {},
      config: {
        url: '/api/v1/terminal/applet-hosts/',
        activeMenu: 'Detail',
        submenu: [
          {
            'title': 'AppletHostDetail',
            'name': 'Detail'
          }
        ],
        hasRightSide: true,
        actions: {
          updateCallback: () => {
            const category = this.asset.category.value || 'host'
            const routerName = _.capitalize(category) + 'Update'
            this.$router.push({
              name: routerName,
              params: { id: this.$route.params.id },
              query: { platform: this.asset.platform.id }
            })
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
