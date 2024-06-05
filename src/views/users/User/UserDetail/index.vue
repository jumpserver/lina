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
import AssetPermissionDetail from '@/views/perms/AssetPermission/AssetPermissionDetail/index.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    UserInfo,
    UserLoginAcl,
    GenericDetailPage,
    UserGrantedAssets,
    UserAssetPermissionRules,
    AssetPermissionDetail,
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
            name: 'UserLoginAcl'
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

<style lang='scss' scoped>

</style>
