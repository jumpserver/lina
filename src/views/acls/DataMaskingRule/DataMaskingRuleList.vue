<template>
  <GenericListPage :header-actions="headerActions" :help-tip="helpMsg" :table-config="tableConfig" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      helpMsg: this.$t('AssetLoginACLHelpMsg'),
      tableConfig: {
        url: '/api/v1/acls/data-masking-rules/',
        columnsExclude: ['users', 'assets', 'accounts', 'rules'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'priority', 'is_active', 'comment', 'actions'
          ]
        }
      },
      updateRoute: 'DataMaskingRuleUpdate',
      headerActions: {
        createRoute: 'DataMaskingRuleCreate',
        hasRefresh: true,
        hasExport: false,
        hasImport: false
      }
    }
  }
}
</script>
