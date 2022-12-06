<template>
  <GenericDetailPage :object.sync="execution" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="execution" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import ChangeSecreAtutomationExecutionInfo from './ChangeSecreAtutomationExecutionInfo'
import ChangeSecreAtutomationExecutionTaskList from './ChangeSecreAtutomationExecutionTaskList'

export default {
  components: {
    GenericDetailPage,
    ChangeSecreAtutomationExecutionInfo,
    ChangeSecreAtutomationExecutionTaskList
  },
  data() {
    return {
      execution: { id: '' },
      config: {
        url: '/api/v1/assets/automation-executions/',
        activeMenu: 'ChangeSecreAtutomationExecutionInfo',
        actions: {
          hasUpdate: false,
          hasDelete: false
        },
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'ChangeSecreAtutomationExecutionInfo',
            hidden: () => !this.$hasPerm('assets.view_automationexecution')
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.TaskList'),
            name: 'ChangeSecreAtutomationExecutionTaskList',
            hidden: () => !this.$hasPerm('assets.view_changesecretrecord')
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
