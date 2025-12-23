<template>
  <GenericDetailPage v-model:active-menu="config.activeMenu" v-model:object="execution" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="execution" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import CheckAccountExecutionInfo from './CheckAccountExecutionInfo.vue'

export default {
  components: {
    GenericDetailPage,
    CheckAccountExecutionInfo
  },
  data() {
    return {
      execution: { id: '' },
      config: {
        url: '/api/v1/accounts/check-account-executions',
        activeMenu: 'CheckAccountExecutionInfo',
        actions: {
          hasUpdate: false,
          hasDelete: false
        },
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'CheckAccountExecutionInfo',
            hidden: () => !this.$hasPerm('accounts.view_checkaccountexecution')
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
