<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu">
    <keep-alive>
      <component :is="config.activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import EscapeRoutePlanList from './EscapeRoutePlanList'
export default {
  name: 'Index',
  components: {
    TabPage,
    EscapeRoutePlanList
  },
  data() {
    return {
      config: {
        activeMenu: 'EscapeRoutePlanList',
        submenu: [
          {
            title: this.$t('xpack.EscapeRoutePlan.EscapeRoutePlan'),
            name: 'EscapeRoutePlanList'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
