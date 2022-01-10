<template>
  <GenericDetailPage :object.sync="plan" :active-menu.sync="config.activeMenu" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="plan" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import EscapeRoutePlanInfo from './EscapeRoutePlanInfo'
import EscapeRoutePlanExecutionList from './EscapeRoutePlanExecution/EscapeRoutePlanExecutionList'

export default {
  components: {
    GenericDetailPage,
    EscapeRoutePlanInfo,
    EscapeRoutePlanExecutionList
  },
  data() {
    return {
      plan: { name: '', comment: '' },
      config: {
        activeMenu: 'EscapeRoutePlanInfo',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'EscapeRoutePlanInfo'
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.ExecutionList'),
            name: 'EscapeRoutePlanExecutionList'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
