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
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.AppChangeAuthPlan'),
            name: 'AppChangeAuthPlanList',
            hidden: () => !this.$hasPerm('xpack.view_applicationchangeauthplan'),
            component: () => import('@/views/accounts/ChangeAuthPlan/AppChangeAuthPlan/AppChangeAuthPlanList.vue')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
