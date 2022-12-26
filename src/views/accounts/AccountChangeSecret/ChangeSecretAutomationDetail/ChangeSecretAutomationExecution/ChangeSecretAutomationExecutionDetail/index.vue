<template>
  <GenericDetailPage :object.sync="execution" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="execution" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import ChangeSecretAutomationExecutionInfo from './ChangeSecretAutomationExecutionInfo'
import ChangeSecretAutomationExecutionTaskList from './ChangeSecretAutomationExecutionTaskList'

export default {
  components: {
    GenericDetailPage,
    ChangeSecretAutomationExecutionInfo,
    ChangeSecretAutomationExecutionTaskList
  },
  data() {
    return {
      execution: { id: '' },
      config: {
        url: '/api/v1/assets/automation-executions/',
        activeMenu: 'ChangeSecretAutomationExecutionInfo',
        actions: {
          hasUpdate: false,
          hasDelete: false
        },
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'ChangeSecretAutomationExecutionInfo',
            hidden: () => !this.$hasPerm('assets.view_changesecretexecution')
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.TaskList'),
            name: 'ChangeSecretAutomationExecutionTaskList',
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
