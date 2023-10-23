<template>
  <div>
    <GenericListPage :header-actions="headerActions" :help-message="helpMsg" :table-config="tableConfig" />
    <AssetLoginAclCreateUpdate />
  </div>
</template>

<script>
import { GenericListPage } from '@/layout/components'
import AssetLoginAclCreateUpdate from './AssetLoginAclCreateUpdate.vue'

export default {
  components: {
    GenericListPage,
    AssetLoginAclCreateUpdate
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
