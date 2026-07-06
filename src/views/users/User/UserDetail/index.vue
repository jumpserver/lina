<template>
  <GenericDetailPage v-bind="config" v-model:active-menu="config.activeMenu" v-model:object="user">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import { mapGetters } from 'vuex'

import AssetPermissionAccount from '@/views/perms/AssetPermission/AssetPermissionDetail/AssetPermissionAccount.vue'
import AssetPermissionAsset from '@/views/perms/AssetPermission/AssetPermissionDetail/AssetPermissionAsset.vue'
import AssetPermissionUser from '@/views/perms/AssetPermission/AssetPermissionDetail/AssetPermissionUser.vue'
import AssetPermissionDetail from '@/views/perms/AssetPermission/AssetPermissionDetail/index.vue'
import UserAssetPermissionRules from './UserAssetPermissionRules'
import UserGrantedAssets from './UserGrantedAssets'
import UserInfo from './UserInfo'
import UserLoginACL from './UserLoginACL.vue'
import UserSession from './UserSession.vue'

export default {
  components: {
    UserInfo,
    UserSession,
    UserLoginACL,
    GenericDetailPage,
    UserGrantedAssets,
    AssetPermissionUser,
    AssetPermissionAsset,
    AssetPermissionDetail,
    AssetPermissionAccount,
    UserAssetPermissionRules
  },
  data() {
    const vm = this
    return {
      user: { name: '', username: '', email: '', comment: '' },
      config: {
        url: '/api/v1/users/users',
        activeMenu: 'UserInfo',
        actions: {
          canUpdate: () => {
            return (
              this.$hasPerm('users.change_user') &&
              !(!this.currentUserIsSuperAdmin && this.user['is_superuser'])
            )
          }
        },
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'UserInfo'
          },
          {
            title: this.$t('GrantedAssets'),
            name: 'UserGrantedAssets',
            hidden: () => !vm.$hasPerm('perms.view_userassets')
          },
          {
            title: this.$t('AssetPermissionRules'),
            name: 'UserAssetPermissionRules',
            hidden: () => !vm.$hasPerm('perms.view_assetpermission')
          },
          {
            title: this.$t('UserACLss'),
            name: 'UserLoginACL',
            hidden: () => !vm.$hasPerm('acls.view_loginacl')
          },
          {
            title: this.$t('UserSession'),
            name: 'UserSession',
            hidden: () => !vm.$hasPerm('terminal.view_session')
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['currentUserIsSuperAdmin'])
  },
  methods: {
    handleTabClick(tab) {
      this.$log.debug('Current nav is: ', this.config.activeMenu)
    }
  }
}
</script>
