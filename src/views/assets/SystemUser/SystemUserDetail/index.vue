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
import AppList from './AppList'
import AppAccountList from './AppAccountList'
import SwitchToUserList from './SwitchToUserList'

export default {
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    AssetList,
    AccountList,
    AppList,
    AppAccountList,
    SwitchToUserList
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
            name: 'AssetList',
            hidden: () => {
              return !(vm.systemUser['is_asset_protocol'] && vm.$hasPerm('assets.view_authbook'))
            }
          },
          {
            title: this.$t('assets.AccountList'),
            name: 'AccountList',
            hidden: () => {
              return !(vm.systemUser['is_asset_protocol'] && vm.$hasPerm('assets.view_authbook'))
            }
          },
          {
            title: this.$t('assets.AppList'),
            name: 'AppList',
            hidden: () => {
              return !(!vm.systemUser['is_asset_protocol'] && vm.$hasPerm('applications.view_account'))
            }
          },
          {
            title: this.$t('assets.AccountList'),
            name: 'AppAccountList',
            hidden: () => {
              return !(!vm.systemUser['is_asset_protocol'] && vm.$hasPerm('applications.view_account'))
            }
          },
          {
            title: this.$t('assets.SwitchToUser'),
            name: 'SwitchToUserList',
            hidden: () => {
              return vm.systemUser['protocol'] !== 'ssh'
            }
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
              query: {
                type: vm.systemUser.type,
                protocol: vm.systemUser.protocol
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
