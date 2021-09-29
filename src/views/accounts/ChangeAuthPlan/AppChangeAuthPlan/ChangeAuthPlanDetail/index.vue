<template>
  <GenericDetailPage :object.sync="plan" :active-menu.sync="config.activeMenu" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="plan" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import ChangeAuthPlanDatabase from './ChangeAuthPlanApp/index'
import AppChangeAuthPlanInfo from './AppChangeAuthPlanInfo'
import AppChangeAuthPlanExecutionList from './AppChangeAuthPlanExecution/ChangeAuthPlanExecutionList'

export default {
  name: 'AppChangeAuthPlanDetail',
  components: {
    GenericDetailPage,
    ChangeAuthPlanDatabase,
    AppChangeAuthPlanInfo,
    AppChangeAuthPlanExecutionList
  },
  data() {
    const vm = this
    return {
      plan: { name: '', comment: '' },
      config: {
        activeMenu: 'AppChangeAuthPlanInfo',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'AppChangeAuthPlanInfo'
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.SystemUser'),
            name: 'ChangeAuthPlanDatabase'
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.ExecutionList'),
            name: 'AppChangeAuthPlanExecutionList'
          }
        ],
        actions: {
          updateCallback: () => {
            const id = this.$route.params.id
            const routeName = 'AppChangeAuthPlanUpdate'
            this.$router.push({
              name: routeName,
              params: { id: id },
              query: {
                category: vm.plan.category.toLowerCase(),
                type: vm.plan.type.toLowerCase()
              }
            })
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
