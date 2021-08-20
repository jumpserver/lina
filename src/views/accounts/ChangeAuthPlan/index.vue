<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu">
    <keep-alive>
      <component :is="config.activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import AssetChangeAuthPlanList from './AssetChangeAuthPlan/ChangeAuthPlanList'
import DatabaseChangeAuthPlanList from './DatabaseChangeAuthPlan/ChangeAuthPlanList'
export default {
  name: 'Index',
  components: {
    TabPage,
    AssetChangeAuthPlanList,
    DatabaseChangeAuthPlanList
  },
  data() {
    return {
      config: {
        activeMenu: 'AssetChangeAuthPlanList',
        submenu: [
          {
            title: this.$t('xpack.ChangeAuthPlan.AssetChangeAuthPlan'),
            name: 'AssetChangeAuthPlanList'
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.DatabaseChangeAuthPlan'),
            name: 'DatabaseChangeAuthPlanList'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
