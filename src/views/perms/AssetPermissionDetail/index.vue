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

export default {
  components: {
    GenericDetailPage,
    AssetPermissionDetail,
    AssetPermissionUser,
    AssetPermissionAsset,
    TabPage
  },
  data() {
    return {
      AssetPermission: {
        name: '', users: '', user_groups: '', assets: '', nodes: '', system_users: '',
        date_start: '', date_expired: ''
      },
      config: {
        activeMenu: 'AssetPermissionDetail',
        submenu: [
          {
            title: this.$t('perms.AssetPermissionDetail'),
            name: 'AssetPermissionDetail'
          },
          {
            title: this.$t('perms.UsersAndUserGroups'),
            name: 'AssetPermissionUser'
          },
          {
            title: this.$t('perms.AssetAndNode'),
            name: 'AssetPermissionAsset'
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
