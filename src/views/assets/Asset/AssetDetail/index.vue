<template>
  <GenericDetailPage :object.sync="TaskDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail.vue'
import Account from './Account.vue'
import SystemUserList from './SystemUser.vue'
import PermUserList from './PermUser.vue'

export default {
  name: 'AssetListDetail',
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    Account,
    SystemUserList,
    PermUserList
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('assets.AssetDetail'),
            name: 'Detail'
          },
          {
            title: this.$t('assets.SystemUser'),
            name: 'SystemUserList',
            hidden: () => !this.$hasPerm('assets.view_authbook')
          },
          {
            title: this.$t('assets.AccountList'),
            name: 'Account',
            hidden: () => !this.$hasPerm('assets.view_authbook')
          },
          {
            title: this.$t('assets.PermUserList'),
            name: 'PermUserList',
            hidden: () => !this.$hasPerm('perms.view_assetpermission')
          }
        ],
        hasRightSide: true,
        getObjectName: function(obj) {
          return obj.hostname + '(' + obj.ip + ')'
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
