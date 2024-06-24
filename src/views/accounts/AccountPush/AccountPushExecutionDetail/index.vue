<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="execution" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="execution" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AccountPushExecutionInfo from './AccountPushExecutionInfo'
import AccountPushExecutionTaskList from './AccountPushExecutionTaskList'

export default {
  components: {
    GenericDetailPage,
    AccountPushExecutionInfo,
    AccountPushExecutionTaskList
  },
  data() {
    return {
      execution: { id: '' },
      config: {
        url: '/api/v1/accounts/push-account-executions',
        activeMenu: 'AccountPushExecutionInfo',
        actions: {
          hasUpdate: false,
          hasDelete: false
        },
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'AccountPushExecutionInfo',
            hidden: () => !this.$hasPerm('accounts.view_pushaccountexecution')
          },
          {
            title: this.$t('TaskList'),
            name: 'AccountPushExecutionTaskList',
            hidden: () => !this.$hasPerm('accounts.view_changesecretrecord')
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
