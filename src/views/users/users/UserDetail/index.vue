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
            title: this.$t('common.basicInfo'),
            name: 'UserInfo'
          },
          {
            title: this.$t('perms.grantedAssets'),
            name: 'UserGrantedAssets'
          },
          {
            title: this.$t('perms.assetPermissionRules'),
            name: 'UserAssetPermissionRules'
          },
          {
            title: this.$t('perms.grantedRemoteApps'),
            name: 'UserGrantedRemoteApps'
          },
          {
            title: this.$t('perms.remoteAppsPermissionRules'),
            name: 'UserRemoteAppPermissionRules'
          },
          {
            title: this.$t('perms.grantedDatabases'),
            name: 'UserGrantedDatabases'
          },
          {
            title: this.$t('perms.databasePermissionRules'),
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
