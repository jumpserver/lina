<template>
  <GenericDetailPage :object.sync="group" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="group" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import UserGroupPerm from './perms'
import TabDetail from './detail'

export default {
  components: {
    GenericDetailPage,
    UserGroupPerm,
    TabDetail,
    TabPage
  },
  data() {
    return {
      group: { name: '', comment: '', users: [] },
      config: {
        activeMenu: 'TabDetail',
        submenu: [
          {
            title: this.$tc('Basic Info'),
            name: 'TabDetail'
          },
          {
            title: this.$t('perms.Asset permissions'),
            name: 'UserGroupPerm'
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
