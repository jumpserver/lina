<template>
  <GenericDetailPage :object.sync="group" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="group" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import GroupGrantedAssets from './GroupGrantedAssets'
import GroupInfo from './GroupInfo'

export default {
  components: {
    GenericDetailPage,
    GroupGrantedAssets,
    GroupInfo,
    TabPage
  },
  data() {
    return {
      group: { name: '', comment: '', users: [] },
      config: {
        activeMenu: 'GroupInfo',
        submenu: [
          {
            title: this.$ttc('basicInfo'),
            name: 'GroupInfo'
          },
          {
            title: this.$tt('users.grantedAssets'),
            name: 'GroupGrantedAssets'
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
