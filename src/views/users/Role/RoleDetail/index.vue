<template>
  <GenericDetailPage
    :object.sync="group"
    :active-menu.sync="config.activeMenu"
    v-bind="config"
    v-on="$listeners"
  >
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
    const vm = this
    return {
      group: { name: '', comment: '', users: [] },
      config: {
        url: '/api/v1/rbac/roles/',
        activeMenu: 'RoleInfo',
        actions: {
          canDelete: () => {
            return vm.hasPermNotBuiltinNotRootOrg(this.group, 'rbac.delete_role')
          },
          canUpdate: () => {
            return vm.hasPermNotBuiltinNotRootOrg(this.group, 'rbac.change_role')
          }
        },
        submenu: [
          {
            title: this.$t('users.RoleInfo'),
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
    },
    hasPermNotBuiltinNotRootOrg(row, perm) {
      console.log('Row is: ', row)
      console.log('Build: ', !row['builtin'])
      return !row['builtin'] &&
        this.$hasPerm(perm) &&
        !this.$isRootOrg()
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
