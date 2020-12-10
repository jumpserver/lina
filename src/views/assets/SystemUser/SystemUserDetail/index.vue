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
import AccountList from './AccountList.vue'
export default {
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    AssetList,
    AccountList
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('assets.SystemUserDetail'),
            name: 'Detail'
          },
          {
            title: this.$t('assets.AssetList'),
            name: 'AssetList'
          },
          {
            title: this.$t('assets.AccountList'),
            name: 'AccountList'
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
