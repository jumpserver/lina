<template>
  <GenericDetailPage :object.sync="AssetPermission" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners" @tab-click="TabClick">
    <keep-alive>
      <component :is="config.activeMenu" :object="AssetPermission" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import AssetPermissionDetail from './AssetPermissionDetail'
import AssetPermissionUser from './AssetPermissionUser'
import AssetPermissionAsset from './AssetPermissionAsset'
import AssetPermissionAccount from './AssetPermissionAccount'

export default {
  components: {
    GenericDetailPage,
    AssetPermissionDetail,
    AssetPermissionUser,
    AssetPermissionAsset,
    AssetPermissionAccount,
    TabPage
  },
  data() {
    return {
      AssetPermission: {
        name: '', users_amount: 0, user_groups_amount: 0, assets_amount: 0, nodes_amount: 0, system_users_amount: 0,
        date_start: '', date_expired: ''
      },
      config: {
        activeMenu: 'AssetPermissionDetail',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'AssetPermissionDetail'
          },
          {
            title: this.$t('perms.usersAndUserGroups'),
            name: 'AssetPermissionUser',
            hidden: () => !this.$hasPerm('users.view_user') || !this.$hasPerm('perms.change_assetpermission')
          },
          {
            title: this.$t('perms.assetAndNode'),
            name: 'AssetPermissionAsset',
            hidden: () => !this.$hasPerm('assets.view_asset') || !this.$hasPerm('perms.change_assetpermission')
          },
          {
            title: this.$t('perms.permAccount'),
            name: 'AssetPermissionAccount',
            hidden: () => !this.$hasPerm('accounts.view_account') || !this.$hasPerm('perms.change_assetpermission')
          }
        ]
      }
    }
  },
  methods: {
    TabClick(tab) {
      if (tab.name !== 'AssetPermissionDetail') {
        this.$set(this.config, 'hasRightSide', false)
      } else {
        this.$set(this.config, 'hasRightSide', true)
      }
    }
  }
}
</script>

<style scoped>

</style>
