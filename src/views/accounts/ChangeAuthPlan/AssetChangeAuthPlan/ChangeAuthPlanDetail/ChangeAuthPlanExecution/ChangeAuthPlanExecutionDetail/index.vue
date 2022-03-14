<template>
  <GenericDetailPage :object.sync="execution" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="execution" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import ChangeAuthPlanExecutionInfo from './ChangeAuthPlanExecutionInfo'
import ChangeAuthPlanExecutionTaskList from './ChangeAuthPlanExecutionTaskList'

export default {
  components: {
    GenericDetailPage,
    ChangeAuthPlanExecutionInfo,
    ChangeAuthPlanExecutionTaskList
  },
  data() {
    return {
      execution: { id: '' },
      config: {
        activeMenu: 'ChangeAuthPlanExecutionInfo',
        actions: {
          hasUpdate: false,
          hasDelete: false
        },
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'ChangeAuthPlanExecutionInfo',
            hidden: () => !this.$hasPerm('xpack.view_changeauthplanexecution')
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.TaskList'),
            name: 'ChangeAuthPlanExecutionTaskList',
            hidden: () => !this.$hasPerm('xpack.view_changeauthplantask')
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
