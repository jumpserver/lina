<template>
  <GenericListPage :header-actions="headerActions" :help-message="helpMsg" :table-config="tableConfig" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      helpMsg: this.$t('acl.AssetLoginACLHelpMsg'),
      tableConfig: {
        url: '/api/v1/acls/login-asset-acls/',
        columnsExclude: ['users', 'assets', 'accounts'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'priority', 'is_active', 'comment', 'actions'
          ]
        }
      },
      updateRoute: 'AssetAclUpdate',
      headerActions: {
        createRoute: 'AssetAclCreate',
        hasRefresh: true,
        hasExport: false,
        hasImport: false
      }
    }
  }
}
</script>

<style>

</style>
