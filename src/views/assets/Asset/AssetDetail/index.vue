<template>
  <GenericDetailPage
    :active-menu.sync="config.activeMenu"
    :object.sync="asset"
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
import Detail from './Detail.vue'
import Account from './Account.vue'
import PermUserList from './PermUser.vue'
import AccountActivity from './components/Activity.vue'

export default {
  name: 'AssetListDetail',
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    Account,
    PermUserList,
    AccountActivity
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
            title: this.$t('common.Activity'),
            name: 'AccountActivity',
            hidden: () => !this.$hasPerm('audits.view_operatelog') || !this.$hasPerm('terminal.view_session')
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
                platform_type: this.asset.type.value
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
