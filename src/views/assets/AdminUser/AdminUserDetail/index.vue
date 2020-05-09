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
import AssetList from './AssetsList.vue'
export default {
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
        title: this.$t('assets.AdminUserDetail'),
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('assets.detail'),
            name: 'Detail'
          },
          {
            title: this.$t('assets.assetlist'),
            name: 'AssetList'
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
