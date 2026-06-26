<template>
  <TabPage v-model:active-menu="activeMenu" :submenu="submenu">
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
          title: this.$t('TaskList'),
          name: 'TaskList'
        },
        {
          title: this.$t('Cleaning'),
          name: 'Clean',
          hidden: !this.$hasPerm('settings.change_clean')
        }
      ]
    }
  }
}
</script>
