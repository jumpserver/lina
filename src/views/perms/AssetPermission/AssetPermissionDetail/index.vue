<template>
  <AutoTabDetailPage :object.sync="AssetPermission" :config="config" :active-menu.sync="activeMenu" v-on="$listeners" @tab-click="TabClick">
    <keep-alive>
      <component :is="activeMenu" :object="AssetPermission" />
    </keep-alive>
  </AutoTabDetailPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import AssetPermissionDetail from './AssetPermissionDetail'
import AssetPermissionUser from './AssetPermissionUser'
import AssetPermissionAsset from './AssetPermissionAsset'
import AutoTabDetailPage from './AutoTabDetailPage'

const ASSET_PERMISSION_DETAIL = 'AssetPermissionDetail'
const ASSET_PERMISSION_USER = 'AssetPermissionUser'
const ASSET_PERMISSION_ASSET = 'AssetPermissionAsset'

export default {
  components: {
    AutoTabDetailPage,
    AssetPermissionDetail,
    AssetPermissionUser,
    AssetPermissionAsset,
    TabPage
  },
  data() {
    return {
      AssetPermission: {
        name: '', users_amount: 0, user_groups_amount: 0, assets_amount: 0, nodes_amount: 0, system_users_amount: 0,
        date_start: '', date_expired: ''
      },
      activeMenu: '',
      config: {
        colMenuMapper: {
          users_amount: ASSET_PERMISSION_USER,
          assets_amount: ASSET_PERMISSION_ASSET
        },
        submenu: [
          {
            title: this.$t('perms.assetPermissionDetail'),
            name: ASSET_PERMISSION_DETAIL
          },
          {
            title: this.$t('perms.usersAndUserGroups'),
            name: ASSET_PERMISSION_USER
          },
          {
            title: this.$t('perms.assetAndNode'),
            name: ASSET_PERMISSION_ASSET
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
