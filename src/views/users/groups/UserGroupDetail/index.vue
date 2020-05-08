<template>
  <GenericDetailPage :object.sync="group" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="group" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import GroupAssetPermission from './GroupAssetPermission'
import GroupInfo from './GroupInfo'

export default {
  components: {
    GenericDetailPage,
    GroupAssetPermission,
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
            title: this.$tic('basicInfoTitle'),
            name: 'GroupInfo'
          },
          {
            title: this.$t('perms.Asset permissions'),
            name: 'GroupAssetPermission'
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
