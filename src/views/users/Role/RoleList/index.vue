<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu">
    <div slot="title">
      {{ Title }}
    </div>
    <keep-alive>
      <component :is="config.activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import OrgRoleList from './OrgRoleList'
import SysRoleList from './SysRoleList'
export default {
  name: 'Index',
  components: {
    TabPage,
    SysRoleList,
    OrgRoleList
  },
  data() {
    return {
      config: {
        activeMenu: 'OrgRoleList',
        submenu: [
          {
            title: this.$t('route.OrgRole'),
            name: 'OrgRoleList',
            hidden: () => {
              return !this.$store.getters.hasValidLicense
            }
          },
          {
            title: this.$t('route.SystemRole'),
            name: 'SysRoleList',
            hidden: () => {
              return !this.$hasPerm('rbac.view_systemrole')
            }
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
  }
}
</script>

<style scoped>

</style>
