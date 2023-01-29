<template>
  <GenericDetailPage
    :active-menu.sync="config.activeMenu"
    :object.sync="role"
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
    const scope = this.$route.query['scope']
    const scopeRole = `${scope}role`
    return {
      scope: scope,
      scopeRole: scope + 'role',
      role: { name: '', comment: '', users: [] },
      config: {
        titlePrefix: scope === 'org' ? vm.$t('route.OrgRole') : vm.$t('route.SystemRole'),
        url: `/api/v1/rbac/${scope}-roles`,
        activeMenu: 'RoleInfo',
        actions: {
          canDelete: () => {
            return vm.hasPermNotBuiltin(this.role, `rbac.delete_${scopeRole}`)
          },
          canUpdate: () => {
            return vm.hasPermNotBuiltin(this.role, `rbac.change_${scopeRole}`)
          },
          updateRoute: {
            name: this.$route.name.replace('Detail', 'Update'),
            params: {},
            query: { scope: scope }
          }
        },
        submenu: [
          {
            title: this.$t('users.RoleInfo'),
            name: 'RoleInfo'
          },
          {
            title: this.$t('users.RoleUsers'),
            name: 'RoleUsers',
            hidden: () => !this.$hasPerm(`rbac.view_${scope}rolebinding`)
          }
        ]
      }
    }
  },
  methods: {
    hasPermNotBuiltin(row, perm) {
      return !row['builtin'] && this.$hasPerm(perm)
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
