<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import {
  userAssetAccountFieldNames,
  fieldsMetaListPageForUserAssetAccount
} from '../common'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/acls/login-asset-acls/',
        columns: [
          'name',
          ...userAssetAccountFieldNames,
          'reviewers', 'priority',
          'is_active', 'comment', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name',
            ...userAssetAccountFieldNames,
            'reviewers', 'priority', 'is_active', 'comment', 'actions'
          ]
        },
        columnsMeta: {
          ...fieldsMetaListPageForUserAssetAccount,
          reviewers: {
            formatter: function(row) {
              return <span> { row.reviewers.length }</span>
            }
          }
        }
      },
      updateRoute: 'AssetAclUpdate',
      headerActions: {
        createRoute: 'AssetAclCreate',
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasMoreActions: false
      }
    }
  }
}
</script>

<style>

</style>
