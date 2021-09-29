<template>
  <GenericDetailPage :object.sync="execution" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="execution" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AppChangeAuthPlanExecutionInfo from './ChangeAuthPlanExecutionInfo'
import AppChangeAuthPlanExecutionTaskList from './ChangeAuthPlanExecutionTaskList'

export default {
  name: 'AppChangeAuthPlanExecutionDetail',
  components: {
    GenericDetailPage,
    AppChangeAuthPlanExecutionInfo,
    AppChangeAuthPlanExecutionTaskList
  },
  data() {
    return {
      execution: { id: '' },
      config: {
        activeMenu: 'AppChangeAuthPlanExecutionInfo',
        actions: {
          hasUpdate: false,
          hasDelete: false
        },
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'AppChangeAuthPlanExecutionInfo'
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.TaskList'),
            name: 'AppChangeAuthPlanExecutionTaskList'
          }
        ],
        getTitle: this.getExecutionTitle

      }
    }
  },
  methods: {
    getExecutionTitle() {
      return `${this.$route.meta.title}: ${this.execution.id}`
    }
  }
}
</script>

<style scoped>

</style>
