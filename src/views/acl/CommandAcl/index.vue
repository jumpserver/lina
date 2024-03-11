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
      const query = _.cloneDeep(this.$route.query)
      const newQuery = {
        ...query,
        activeTab: tab.name
      }
      this.$nextTick(() => {
        this.$router.replace({ query: newQuery })
      })
    }
  }
}
</script>

<style scoped>

</style>
