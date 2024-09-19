<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="user" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { mapGetters } from 'vuex'
import { GenericDetailPage } from '@/layout/components'

import UserInfo from './UserInfo'
import UserSession from './UserSession.vue'
import UserLoginAcl from './UserLoginAcl.vue'
import UserGrantedAssets from './UserGrantedAssets'
import AssetPermissionUser from '@/views/perms/AssetPermission/AssetPermissionDetail/AssetPermissionUser.vue'
import AssetPermissionAsset from '@/views/perms/AssetPermission/AssetPermissionDetail/AssetPermissionAsset.vue'
import AssetPermissionDetail from '@/views/perms/AssetPermission/AssetPermissionDetail/index.vue'
import AssetPermissionAccount from '@/views/perms/AssetPermission/AssetPermissionDetail/AssetPermissionAccount.vue'
import UserAssetPermissionRules from './UserAssetPermissionRules'
import store from '@/store'

export default {
  components: {
    UserInfo,
    UserSession,
    UserLoginAcl,
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
        activeMenu: 'UserInfo',
        actions: {
          canUpdate: () => {
            return this.$hasPerm('users.change_user') &&
              !(!this.currentUserIsSuperAdmin && this.user['is_superuser'])
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
            title: this.$t('UserAclLists'),
            name: 'UserLoginAcl',
            hidden: () => !vm.$hasPerm('acls.view_loginacl') || !store.getters.publicSettings.XPACK_LICENSE_IS_VALID
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
