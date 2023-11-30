<template>
  <GenericDetailPage
    :active-menu.sync="config.activeMenu"
    :object.sync="asset"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :exclude="'Account'" :object="asset" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail.vue'
import Account from './Account.vue'
import PermUserList from './PermUser.vue'
import AssetSession from './AssetSession.vue'
import AssetCommand from './AssetCommand.vue'

export default {
  name: 'AssetListDetail',
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    Account,
    PermUserList,
    AssetSession,
    AssetCommand
  },
  data() {
    return {
      asset: {},
      config: {
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('assets.AssetDetail'),
            name: 'Detail'
          },
          {
            title: this.$t('assets.AccountList'),
            name: 'Account',
            hidden: () => !this.$hasPerm('accounts.view_account')
          },
          {
            title: this.$t('assets.PermUserList'),
            name: 'PermUserList',
            hidden: () => !this.$hasPerm('perms.view_assetpermission')
          },
          {
            title: this.$t('route.SessionList'),
            name: 'AssetSession',
            hidden: () => !this.$hasPerm('terminal.view_session')
          },
          {
            title: this.$t('route.Commands'),
            name: 'AssetCommand',
            hidden: () => !this.$hasPerm('terminal.view_command')
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
              query: {
                platform: this.asset.platform.id,
                type: this.asset.type.value
              }
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
