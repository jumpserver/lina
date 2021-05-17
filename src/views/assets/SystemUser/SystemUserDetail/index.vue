<template>
  <GenericDetailPage :object.sync="systemUser" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="systemUser" />
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
    const vm = this
    return {
      systemUser: {},
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
        hasRightSide: true,
        actions: {
          updateCallback: () => {
            const id = this.$route.params.id
            const routeName = 'SystemUserUpdate'
            this.$router.push({
              name: routeName,
              params: { id: id },
              query: { protocol: vm.systemUser.protocol }
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
