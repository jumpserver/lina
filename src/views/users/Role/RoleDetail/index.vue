<template>
  <GenericDetailPage
    :object.sync="role"
    :active-menu.sync="config.activeMenu"
    :url="url"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="role" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import RoleInfo from './RoleInfo'
import RoleUsers from './RoleUsers'

export default {
  components: {
    GenericDetailPage,
    RoleInfo,
    RoleUsers
  },
  data() {
    const vm = this
    return {
      role: { name: '', comment: '', users: [] },
      config: {
        activeMenu: 'RoleInfo',
        actions: {
          canDelete: () => {
            return vm.hasPermNotBuiltinNotRootOrg(this.role, 'rbac.delete_role')
          },
          canUpdate: () => {
            return vm.hasPermNotBuiltinNotRootOrg(this.role, 'rbac.change_role')
          }
        },
        submenu: [
          {
            title: this.$t('users.RoleInfo'),
            name: 'RoleInfo',
            hidden: () => !this.$hasPerm('rbac.view_role')
          },
          {
            title: this.$t('users.RoleUsers'),
            name: 'RoleUsers',
            hidden: () => !this.$hasPerm('rbac.view_role')
          }
        ]
      }
    }
  },
  computed: {
    url() {
      const scope = this.$route.query['scope'] || 'org'
      return `/api/v1/rbac/${scope}-roles`
    }
  },
  methods: {
    handleTabClick(tab) {
      this.$log.debug('Current nav is: ', this.config.activeMenu)
    },
    hasPermNotBuiltinNotRootOrg(row, perm) {
      return !row['builtin'] &&
        this.$hasPerm(perm) &&
        !this.$isRootOrg()
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
