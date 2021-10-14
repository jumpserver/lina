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
import Permusers from './Permusers.vue'

export default {
  name: 'AssetListDetail',
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    Account,
    SystemUserList,
    Permusers
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
            name: 'SystemUserList'
          },
          {
            title: this.$t('assets.AccountList'),
            name: 'Account'
          },
          {
            title: this.$t('assets.PermUsers'),
            name: 'Permusers'
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
