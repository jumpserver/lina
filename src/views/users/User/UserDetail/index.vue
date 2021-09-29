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
import UserGrantedApplications from './UserGrantedApplications'
import UserApplicationPermissionRules from './UserApplicationsPermissionRules'
import UserGrantedDatabases from './UserGrantedDatabases'
import UserGrantedK8Ss from './UserGrantedK8Ss'
import UserK8SPermissionRules from './UserK8SPermissionRules'
import UserLoginACLList from '@/views/acl/UserLoginACL/SingleUserLoginACLList'
import UserDatabasePermissionRules from './UserDatabasePermissionRules'
import UserInfo from './UserInfo'

export default {
  components: {
    GenericDetailPage,
    UserInfo,
    UserGrantedAssets,
    UserAssetPermissionRules,
    UserGrantedApplications,
    UserApplicationPermissionRules,
    UserGrantedDatabases,
    UserDatabasePermissionRules,
    UserK8SPermissionRules,
    UserGrantedK8Ss,
    UserLoginACLList
  },
  data() {
    const vm = this
    return {
      user: { name: '', username: '', email: '', comment: '' },
      config: {
        activeMenu: 'UserInfo',
        actions: {
          canUpdate: () => vm.user.can_update,
          canDelete: () => vm.user.can_delete
        },
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
            title: this.$t('users.tabs.grantedApplications'),
            name: 'UserGrantedApplications'
          },
          {
            title: this.$t('users.tabs.ApplicationPermissionRules'),
            name: 'UserApplicationPermissionRules'
          },
          {
            title: this.$t('route.UserAclLists'),
            name: 'UserLoginACLList'
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
