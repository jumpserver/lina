<template>
  <GenericDetailPage :object.sync="user" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
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
    UserDatabasePermissionRules
  },
  data() {
    return {
      user: { name: '', username: '', email: '', comment: '' },
      config: {
        activeMenu: 'UserInfo',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'UserInfo'
          },
          {
            title: this.$t('users.tabs.grantedAssets'),
            name: 'UserGrantedAssets'
          },
          {
            title: this.$t('users.tabs.assetPermissionRules'),
            name: 'UserAssetPermissionRules'
          },
          {
            title: this.$t('users.tabs.grantedRemoteApps'),
            name: 'UserGrantedRemoteApps'
          },
          {
            title: this.$t('users.tabs.remoteAppPermissionRules'),
            name: 'UserRemoteAppPermissionRules'
          },
          {
            title: this.$t('users.tabs.grantedDatabases'),
            name: 'UserGrantedDatabases'
          },
          {
            title: this.$t('users.tabs.databasePermissionRules'),
            name: 'UserDatabasePermissionRules'
          }
        ]
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
