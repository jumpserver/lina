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
        activeMenu: 'AssetChangeAuthPlanList',
        submenu: [
          {
            title: this.$t('xpack.ChangeAuthPlan.AssetChangeAuthPlan'),
            name: 'AssetChangeAuthPlanList',
            hidden: () => !this.$hasPerm('xpack.view_changeauthplan'),
            component: () => import('@/views/accounts/ChangeAuthPlan/AssetChangeAuthPlan/ChangeAuthPlanList.vue')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
