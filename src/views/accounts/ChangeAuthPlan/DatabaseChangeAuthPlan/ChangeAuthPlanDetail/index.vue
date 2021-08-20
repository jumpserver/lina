<template>
  <GenericDetailPage :object.sync="plan" :active-menu.sync="config.activeMenu" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="plan" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import ChangeAuthPlanDatabase from './ChangeAuthPlanDatabase/index'
import DatabaseChangeAuthPlanInfo from './ChangeAuthPlanInfo'
import DatabaseChangeAuthPlanExecutionList from './ChangeAuthPlanExecution/ChangeAuthPlanExecutionList'

export default {
  name: 'DatabaseChangeAuthPlanDetail',
  components: {
    GenericDetailPage,
    ChangeAuthPlanDatabase,
    DatabaseChangeAuthPlanInfo,
    DatabaseChangeAuthPlanExecutionList
  },
  data() {
    return {
      plan: { name: '', comment: '' },
      config: {
        activeMenu: 'DatabaseChangeAuthPlanInfo',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'DatabaseChangeAuthPlanInfo'
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.SystemUser'),
            name: 'ChangeAuthPlanDatabase'
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.ExecutionList'),
            name: 'DatabaseChangeAuthPlanExecutionList'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
