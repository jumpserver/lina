<template>
  <TabPage
    :active-menu.sync="config.activeMenu"
    :submenu="config.submenu"
    @tab-click="handleTabClick"
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
            title: this.$t('acl.CommandFilterACL'),
            name: 'CommandFilterACL',
            hidden: !this.$hasPerm('acls.view_commandfilteracl'),
            component: () => import('@/views/acl/CommandAcl/CommandFilterAcl/CommandFilterAclList.vue')
          },
          {
            title: this.$t('acl.CommandGroup'),
            name: 'CommandGroup',
            hidden: !this.$hasPerm('acls.view_commandgroup'),
            component: () => import('@/views/acl/CommandAcl/CommandGroup/CommandGroupList.vue')
          }
        ]
      }
    }
  },
  mounted() {
  },
  methods: {
    handleTabClick(tab) {
      this.$log.debug('Current nav is: ', tab.name)
    }
  }
}
</script>

<style scoped>

</style>
