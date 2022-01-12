<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu">
    <keep-alive>
      <component :is="config.activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import AccountBackupPlanList from './AccountBackupPlanList'
export default {
  name: 'Index',
  components: {
    TabPage,
    AccountBackupPlanList
  },
  data() {
    return {
      config: {
        activeMenu: 'AccountBackupPlanList',
        submenu: [
          {
            title: this.$t('xpack.AccountBackupPlan.AccountBackupPlan'),
            name: 'AccountBackupPlanList'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
