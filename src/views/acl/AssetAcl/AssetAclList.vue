<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
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
