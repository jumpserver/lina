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
import Account from '@/views/assets/Asset/AssetDetail/Account'
import Detail from './Detail'
import Applets from './Applets'

export default {
  name: 'AssetListDetail',
  components: {
    GenericDetailPage,
    Applets,
    TabPage,
    Detail,
    Account
  },
  data() {
    return {
      asset: {},
      config: {
        url: '/api/v1/terminal/applet-hosts/',
        activeMenu: 'Detail',
        submenu: [
          {
            'title': this.$t('common.Detail'),
            'name': 'Detail'
          },
          {
            title: this.$t('assets.Account'),
            name: 'Account'
          },
          {
            'title': this.$t('terminal.Applets'),
            'name': 'Applets'
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
  },
  mounted() {
    this.$route.query.oid = 'SYSTEM'
  }
}
</script>

<style scoped>

</style>
