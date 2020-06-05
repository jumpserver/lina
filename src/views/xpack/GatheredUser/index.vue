<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu">
    <keep-alive>
      <component :is="config.activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import GatheredUserList from './GatheredUserList'
import TaskList from './TaskList'
export default {
  name: 'Index',
  components: {
    TabPage,
    GatheredUserList,
    TaskList
  },
  data() {
    return {
      config: {
        activeMenu: 'GatheredUserList',
        submenu: [
          {
            title: this.$t('xpack.GatherUser.GatherUserList'),
            name: 'GatheredUserList'
          },
          {
            title: this.$t('xpack.GatherUser.GatherUserTaskList'),
            name: 'TaskList'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
