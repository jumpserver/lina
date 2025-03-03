<template>
  <GenericListPage :header-actions="headerActions" :help-tip="helpText" :table-config="tableConfig" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  name: 'ConnectMethodListACL',
  components: { GenericListPage },
  data() {
    return {
      helpText: this.$t('ConnectMethodACLHelpMsg'),
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
