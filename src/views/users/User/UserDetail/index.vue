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
import UserLoginACLList from '@/views/acl/UserLoginACL/UserLoginACLList'
import UserInfo from './UserInfo'

export default {
  components: {
    GenericDetailPage,
    UserInfo,
    UserGrantedAssets,
    UserAssetPermissionRules,
    UserGrantedApplications,
    UserApplicationPermissionRules,
    UserLoginACLList
  },
  data() {
    const vm = this
    return {
      user: { name: '', username: '', email: '', comment: '' },
      config: {
        activeMenu: 'UserInfo',
        actions: {
          canUpdate: this.$hasPerm('users.change_user')
        },
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'UserInfo'
          },
          {
            title: this.$t('users.tabs.grantedAssets'),
            name: 'UserGrantedAssets',
            hidden: () => !vm.$hasPerm('perms.view_userassets')
          },
          {
            title: this.$t('users.tabs.assetPermissionRules'),
            name: 'UserAssetPermissionRules',
            hidden: () => !vm.$hasPerm('perms.view_assetpermission')
          },
          {
            title: this.$t('users.tabs.grantedApplications'),
            name: 'UserGrantedApplications',
            hidden: () => !vm.$hasPerm('perms.view_userapps')
          },
          {
            title: this.$t('users.tabs.ApplicationPermissionRules'),
            name: 'UserApplicationPermissionRules',
            hidden: () => !vm.$hasPerm('perms.view_applicationpermission')
          },
          {
            title: this.$t('route.UserAclLists'),
            name: 'UserLoginACLList',
            hidden: () => !vm.$hasPerm('acls.view_loginacl')
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
