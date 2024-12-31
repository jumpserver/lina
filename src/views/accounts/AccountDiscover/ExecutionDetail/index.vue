<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="execution" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="execution" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import Info from './info.vue'

export default {
  name: 'ExecutionDetail',
  components: {
    GenericDetailPage,
    Info
  },
  data() {
    return {
      execution: { id: '' },
      config: {
        activeMenu: 'Info',
        url: '/api/v1/accounts/gather-account-executions',
        actions: {
          hasUpdate: false,
          hasDelete: false
        },
        submenu: [
          {
            title: this.$t('Basic'),
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
