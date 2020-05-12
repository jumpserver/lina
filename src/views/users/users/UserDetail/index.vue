<template>
  <GenericDetailPage :object.sync="user" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import UserAssetPermissionRules from './UserAssetPermissionRules'
import UserGrantedAssets from './UserGrantedAssets'
import UserGrantedRemoteApps from './UserGrantedRemoteApps'
import UserRemoteAppPermissionRules from './UserRemoteAppPermissionRules'
import UserGrantedDatabases from './UserGrantedDatabases'
import UserDatabasePermissionRules from './UserDatabasePermissionRules'
import UserInfo from './UserInfo'

export default {
  components: {
    GenericDetailPage,
    UserInfo,
    UserGrantedAssets,
    UserAssetPermissionRules,
    UserGrantedRemoteApps,
    UserRemoteAppPermissionRules,
    UserGrantedDatabases,
    UserDatabasePermissionRules,
    TabPage
  },
  data() {
    return {
      user: { name: '', username: '', email: '', comment: '' },
      config: {
        activeMenu: 'UserInfo',
        submenu: [
          {
            title: this.$t('common.tabs.BasicInfo'),
            name: 'UserInfo'
          },
          {
            title: this.$t('users.GrantedAssets'),
            name: 'UserGrantedAssets'
          },
          {
            title: this.$t('users.AssetPermissionRules'),
            name: 'UserAssetPermissionRules'
          },
          {
            title: this.$t('users.GrantedRemoteApps'),
            name: 'UserGrantedRemoteApps'
          },
          {
            title: this.$t('users.RemoteAppPermissionRules'),
            name: 'UserRemoteAppPermissionRules'
          },
          {
            title: this.$t('users.GrantedDatabases'),
            name: 'UserGrantedDatabases'
          },
          {
            title: this.$t('users.DatabasePermissionRules'),
            name: 'UserDatabasePermissionRules'
          }
        ],
        actions: {
          canDelete: true,
          canUpdate: true
        }
      }
    }
  },
  methods: {
    handleTabClick(tab) {
      this.$log.debug('Current nav is: ', this.config.activeMenu)
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
