<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu" @tab-click="handleTabClick">
    <div slot="title">
      {{ Title }}
    </div>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'

export default {
  name: 'Index',
  components: {
    TabPage
  },
  data() {
    return {
      config: {
        activeMenu: 'SysRoleList',
        submenu: [
          {
            title: this.$t('route.SystemRole'),
            name: 'SysRoleList',
            hidden: () => !this.$hasPerm('rbac.view_systemrole'),
            component: () => import('@/views/users/Role/RoleList/SysRoleList.vue')
          },
          {
            title: this.$t('route.OrgRole'),
            name: 'OrgRoleList',
            hidden: () => !this.$store.getters.hasValidLicense || !this.$hasPerm('rbac.view_orgrole'),
            component: () => import('@/views/users/Role/RoleList/OrgRoleList.vue')
          }
        ]
      }
    }
  },
  computed: {
    Title() {
      return this.$t('route.RoleList')
    }
  },
  mounted() {
    this.switchGlobalOrg(this.config.activeMenu === 'OrgRoleList')
  },
  methods: {
    handleTabClick(tab) {
      this.switchGlobalOrg(tab.name === 'OrgRoleList')
    },
    switchGlobalOrg(status) {
      if (status) {
        this.$route.meta.disableOrgsChange = false
        this.$store.dispatch('users/leaveGlobalOrg')
      } else {
        this.$route.meta.disableOrgsChange = true
        this.$store.dispatch('users/enterGlobalOrg')
      }
    }
  }
}
</script>

<style scoped>

</style>
