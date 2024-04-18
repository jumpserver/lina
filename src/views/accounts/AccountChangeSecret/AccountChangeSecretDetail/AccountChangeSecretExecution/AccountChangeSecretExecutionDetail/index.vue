<template>
  <GenericDetailPage :object.sync="execution" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="execution" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AccountChangeSecretExecutionInfo from './AccountChangeSecretExecutionInfo'
import AccountChangeSecretRecord from './AccountChangeSecretRecord'

export default {
  components: {
    GenericDetailPage,
    AccountChangeSecretExecutionInfo,
    AccountChangeSecretRecord
  },
  data() {
    return {
      execution: { id: '' },
      config: {
        url: '/api/v1/accounts/change-secret-executions',
        activeMenu: 'AccountChangeSecretExecutionInfo',
        actions: {
          hasUpdate: false,
          hasDelete: false
        },
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'AccountChangeSecretExecutionInfo',
            hidden: () => !this.$hasPerm('accounts.view_changesecretexecution')
          },
          {
            title: this.$t('accounts.AccountChangeSecret.TaskList'),
            name: 'AccountChangeSecretRecord',
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
