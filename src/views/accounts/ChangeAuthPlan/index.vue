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
import CustomCommandList from './CustomChangeAuthCommand/CustomCommandList'
export default {
  name: 'Index',
  components: {
    TabPage,
    AssetChangeAuthPlanList,
    AppChangeAuthPlanList,
    CustomCommandList
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
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.CustomCommand'),
            name: 'CustomCommandList'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
