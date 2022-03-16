<template>
  <GenericDetailPage :object.sync="group" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="group" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import GroupGrantedAssets from './GroupGrantedAssets'
import GroupInfo from './GroupInfo'

export default {
  components: {
    GenericDetailPage,
    GroupGrantedAssets,
    GroupInfo
  },
  data() {
    return {
      group: { name: '', comment: '', users: [] },
      config: {
        url: '/api/v1/users/groups',
        activeMenu: 'GroupInfo',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'GroupInfo'
          },
          {
            title: this.$t('users.tabs.grantedAssets'),
            name: 'GroupGrantedAssets',
            hidden: () => !this.$hasPerm('perms.view_usergroupassets')
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
