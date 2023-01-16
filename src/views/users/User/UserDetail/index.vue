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
import UserLoginACLList from '@/views/acl/UserLoginACL/UserLoginACLList'
import UserInfo from './UserInfo'
import UserActivity from './Activity.vue'

export default {
  components: {
    UserInfo,
    UserLoginACLList,
    GenericDetailPage,
    UserGrantedAssets,
    UserAssetPermissionRules,
    UserActivity
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
            title: this.$t('route.UserAclLists'),
            name: 'UserLoginACLList',
            hidden: () => !vm.$hasPerm('acls.view_loginacl')
          },
          {
            title: this.$t('common.Activity'),
            name: 'UserActivity',
            hidden: () => !this.$hasPerm('audits.view_operatelog') || !this.$hasPerm('audits.view_userloginlog')
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
