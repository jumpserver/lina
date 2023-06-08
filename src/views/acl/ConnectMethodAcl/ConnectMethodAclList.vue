<template>
  <GenericListPage :header-actions="headerActions" :help-message="helpText" :table-config="tableConfig" />
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage/index.vue'

export default {
  name: 'ConnectMethodListAcl',
  components: { GenericListPage },
  data() {
    return {
      helpText: this.$t('acl.ConnectMethodACLHelpMsg'),
      tableConfig: {
        url: '/api/v1/acls/connect-method-acls/',
        columnsExclude: ['users', 'assets', 'accounts'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'priority', 'is_active', 'comment', 'actions'
          ]
        }
      },
      headerActions: {
        hasRefresh: true,
        hasExport: false,
        hasImport: false
      }
    }
  }
}
</script>

<style scoped>

</style>
