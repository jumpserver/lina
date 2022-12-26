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
        activeMenu: 'ChangeSecretAutomationList',
        submenu: [
          {
            title: this.$t('xpack.ChangeAuthPlan.AssetChangeAuthPlan'),
            name: 'ChangeSecretAutomationList',
            hidden: () => !this.$hasPerm('assets.view_changesecretautomation'),
            component: () => import('@/views/accounts/AccountChangeSecret/ChangeSecretAutomationList.vue')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
