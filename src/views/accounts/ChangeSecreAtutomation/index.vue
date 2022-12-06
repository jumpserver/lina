<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu" />
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
        activeMenu: 'ChangeSecreAtutomationList',
        submenu: [
          {
            title: this.$t('xpack.ChangeAuthPlan.AssetChangeAuthPlan'),
            name: 'ChangeSecreAtutomationList',
            hidden: () => !this.$hasPerm('assets.view_changesecretautomation'),
            component: () => import('@/views/accounts/ChangeSecreAtutomation/ChangeSecreAtutomationList.vue')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
