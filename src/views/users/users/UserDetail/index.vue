<template>
  <GenericDetailPage :object.sync="user" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import UserAssetPermission from './UserAssetPermission'
import UserInfo from './UserInfo'

export default {
  components: {
    GenericDetailPage,
    UserAssetPermission,
    UserInfo,
    TabPage
  },
  data() {
    return {
      user: { name: '', username: '', email: '', comment: '' },
      config: {
        activeMenu: 'UserInfo',
        submenu: [
          {
            title: this.$ttc('basicInfo'),
            name: 'UserInfo'
          },
          {
            title: this.$tt('perms.grantedAssets'),
            name: 'UserAssetPermission'
          }
        ],
        actions: {
          canDelete: true,
          canUpdate: true
        }
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
