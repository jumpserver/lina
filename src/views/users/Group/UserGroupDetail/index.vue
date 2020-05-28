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
    // eslint-disable-next-line vue/no-unused-components
    GroupGrantedAssets,
    // eslint-disable-next-line vue/no-unused-components
    GroupInfo
  },
  data() {
    return {
      group: { name: '', comment: '', users: [] },
      config: {
        activeMenu: 'GroupInfo',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'GroupInfo'
          },
          {
            title: this.$t('users.tabs.grantedAssets'),
            name: 'GroupGrantedAssets'
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
