<template>
  <GenericDetailPage :object.sync="execution" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="execution" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import EscapeRoutePlanExecutionInfo from './EscapeRoutePlanExecutionInfo'
import EscapeRoutePlanExecutionTaskList from './EscapeRoutePlanExecutionTaskList'

export default {
  components: {
    GenericDetailPage,
    EscapeRoutePlanExecutionInfo,
    EscapeRoutePlanExecutionTaskList
  },
  data() {
    return {
      execution: { id: '' },
      config: {
        activeMenu: 'EscapeRoutePlanExecutionInfo',
        actions: {
          hasUpdate: false,
          hasDelete: false
        },
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'EscapeRoutePlanExecutionInfo'
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.TaskList'),
            name: 'EscapeRoutePlanExecutionTaskList'
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
