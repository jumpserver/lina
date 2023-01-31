<template>
  <GenericDetailPage :object.sync="execution" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="execution" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import Info from './AccountGatherExecutionInfo'

export default {
  components: {
    GenericDetailPage,
    Info
  },
  data() {
    return {
      execution: { id: '' },
      config: {
        activeMenu: 'Info',
        actions: {
          detailApiUrl: `/api/v1/accounts/gather-account-executions/${this.$route.params.id}/`,
          hasUpdate: false,
          hasDelete: false
        },
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'Info'
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
