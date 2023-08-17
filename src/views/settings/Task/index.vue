<template>
  <TabPage :active-menu.sync="activeMenu" :submenu="submenu">
    <keep-alive>
      <component :is="activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage/index.vue'
import TaskList from './TaskList.vue'
import Clean from './Clean.vue'

export default {
  name: 'Index',
  components: { TabPage, TaskList, Clean },
  data() {
    return {
      activeMenu: 'TaskList',
      submenu: [
        {
          title: this.$t('setting.TaskList'),
          name: 'TaskList'
        },
        {
          title: this.$t('setting.Cleaning'),
          name: 'Clean',
          hidden: !this.$hasPerm('settings.change_clean')
        }
      ]
    }
  }
}
</script>

<style lang='scss' scoped>

</style>
