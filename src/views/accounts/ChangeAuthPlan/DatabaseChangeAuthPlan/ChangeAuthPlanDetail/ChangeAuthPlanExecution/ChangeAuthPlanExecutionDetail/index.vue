<template>
  <GenericDetailPage :object.sync="execution" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="execution" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import DatabaseChangeAuthPlanExecutionInfo from './ChangeAuthPlanExecutionInfo'
import DatabaseChangeAuthPlanExecutionTaskList from './ChangeAuthPlanExecutionTaskList'

export default {
  name: 'DatabaseChangeAuthPlanExecutionDetail',
  components: {
    GenericDetailPage,
    DatabaseChangeAuthPlanExecutionInfo,
    DatabaseChangeAuthPlanExecutionTaskList
  },
  data() {
    return {
      execution: { id: '' },
      config: {
        activeMenu: 'DatabaseChangeAuthPlanExecutionInfo',
        actions: {
          hasUpdate: false,
          hasDelete: false
        },
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'DatabaseChangeAuthPlanExecutionInfo'
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.TaskList'),
            name: 'DatabaseChangeAuthPlanExecutionTaskList'
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
