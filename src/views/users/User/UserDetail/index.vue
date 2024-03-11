<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="user" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import UserAssetPermissionRules from './UserAssetPermissionRules'
import UserGrantedAssets from './UserGrantedAssets'
import UserInfo from './UserInfo'
import UserLoginAcl from './UserLoginAcl.vue'
import UserSession from './UserSession.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    UserInfo,
    UserLoginAcl,
    GenericDetailPage,
    UserGrantedAssets,
    UserAssetPermissionRules,
    UserSession
  },
  data() {
    const vm = this
    return {
      user: { name: '', username: '', email: '', comment: '' },
      config: {
        activeMenu: 'UserInfo',
        actions: {
          canUpdate: () => {
            return this.$hasPerm('users.change_user') &&
              !(!this.currentUserIsSuperAdmin && this.user['is_superuser'])
          }
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
            name: 'UserLoginAcl',
            hidden: () => !vm.$hasPerm('acls.view_loginacl')
          },
          {
            title: this.$t('route.UserSession'),
            name: 'UserSession',
            hidden: () => !vm.$hasPerm('terminal.view_session')
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'currentUserIsSuperAdmin'
    ])
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
