<template>
  <TabPage
    :active-menu.sync="config.activeMenu"
    :submenu="config.submenu"
  />
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
        activeMenu: 'CommandFilterACL',
        submenu: [
          {
            title: this.$tc('CommandFilterACL', 2),
            name: 'CommandFilterACL',
            hidden: !this.$hasPerm('acls.view_commandfilteracl'),
            component: () => import('@/views/acls/CommandFilterACL/CommandFilterAcl/CommandFilterAclList.vue'),
            helpTip: this.$t('CommandFilterACLHelpMsg')
          },
          {
            title: this.$tc('CommandGroup', 2),
            name: 'CommandGroup',
            hidden: !this.$hasPerm('acls.view_commandgroup'),
            component: () => import('@/views/acls/CommandFilterACL/CommandGroup/CommandGroupList.vue')
          }
        ]
      }
    }
  }
}
</script>
