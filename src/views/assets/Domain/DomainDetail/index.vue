<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="TaskDetail" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail.vue'
import GatewayList from './GatewayList.vue'
import AssetList from './AssetList.vue'

export default {
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    GatewayList,
    AssetList
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('assets.DomainDetail'),
            name: 'Detail'
          },
          {
            title: this.$t('assets.GatewayList'),
            name: 'GatewayList',
            hidden: () => !this.$hasPerm('assets.view_gateway')
          },
          {
            title: this.$t('assets.AssetList'),
            name: 'AssetList',
            hidden: () => !this.$hasPerm('assets.view_asset')
          }
        ],
        hasRightSide: true
      }
    }
  }
}
</script>

<style scoped>

</style>
