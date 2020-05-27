<template>
  <GenericDetailPage :object.sync="TaskDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail.vue'
import AssetList from './AssetList.vue'
export default {
  name: 'AssetListDetail',
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    AssetList
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        title: this.$t('assets.SystemUserDetail'),
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('assets.AssetDetail'),
            name: 'Detail'
          },
          {
            title: this.$t('assets.AssetList'),
            name: 'AssetList'
          }
        ],
        hasRightSide: true,
        getObjectName: function(obj) {
          return obj.hostname
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
