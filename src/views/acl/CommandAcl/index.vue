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
            title: this.$t('CommandFilterACL'),
            name: 'CommandFilterACL',
            hidden: !this.$hasPerm('acls.view_commandfilteracl'),
            component: () => import('@/views/acl/CommandAcl/CommandFilterAcl/CommandFilterAclList.vue'),
            helpTip: this.$t('CommandFilterACLHelpMsg')
          },
          {
            title: this.$t('CommandGroup'),
            name: 'CommandGroup',
            hidden: !this.$hasPerm('acls.view_commandgroup'),
            component: () => import('@/views/acl/CommandAcl/CommandGroup/CommandGroupList.vue')
          }
        ]
      }
    }
  }
}
</script>
