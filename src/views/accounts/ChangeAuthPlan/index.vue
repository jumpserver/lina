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
import AppChangeAuthPlanList from './AppChangeAuthPlan/AppChangeAuthPlanList'
export default {
  name: 'Index',
  components: {
    TabPage,
    AssetChangeAuthPlanList,
    AppChangeAuthPlanList
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
            title: this.$t('xpack.ChangeAuthPlan.AppChangeAuthPlan'),
            name: 'AppChangeAuthPlanList'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
