<template>
  <GenericDetailPage v-model:active-menu="config.activeMenu" v-model:object="execution" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="execution" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AccountPushExecutionInfo from './AccountPushExecutionInfo.vue'

export default {
  components: {
    GenericDetailPage,
    AccountPushExecutionInfo
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
