<template>
  <TabPage v-model:active-menu="config.activeMenu" :submenu="config.submenu">
    <template #title>
      <div>
        {{ Title }}
      </div>
    </template>
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
            title: this.$t('SystemRole'),
            name: 'SysRoleList',
            icon: 'fa-solid fa-globe',
            hidden: () => !this.$hasPerm('rbac.view_systemrole'),
            component: () => import('@/views/users/Role/RoleList/SysRoleList.vue'),
            helpTip: this.$t('SystemRoleHelpMsg')
          },
          {
            title: this.$t('OrgRole'),
            name: 'OrgRoleList',
            icon: 'fa-solid fa-sitemap',
            hidden: () =>
              !this.$store.getters.hasValidLicense || !this.$hasPerm('rbac.view_orgrole'),
            component: () => import('@/views/users/Role/RoleList/OrgRoleList.vue'),
            helpTip: this.$t('OrgRoleHelpMsg')
          }
        ]
      }
    }
  },
  computed: {
    Title() {
      return this.$t('RoleList')
    }
  },
  watch: {
    'config.activeMenu'(activeMenu) {
      this.switchGlobalOrg(activeMenu === 'OrgRoleList')
    }
  },
  activated() {
    this.switchGlobalOrg(this.config.activeMenu === 'OrgRoleList')
  },
  mounted() {
    this.switchGlobalOrg(this.config.activeMenu === 'OrgRoleList')
  },
  methods: {
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
