<template>
  <GenericDetailPage :object.sync="group" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="group" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import RolePerms from './RolePerms'
import RoleInfo from './RoleInfo'

export default {
  components: {
    GenericDetailPage,
    RolePerms,
    RoleInfo
  },
  data() {
    return {
      group: { name: '', comment: '', users: [] },
      config: {
        url: '/api/v1/rbac/roles/',
        activeMenu: 'RoleInfo',
        submenu: [
          {
            title: this.$t('common.RoleInfo'),
            name: 'RoleInfo'
          },
          {
            title: this.$t('users.RolePerms'),
            name: 'RolePerms'
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
