<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { ListTable } from '@/components'
import { DetailFormatter } from '@/components/TableFormatters'
import {
  userAssetAccountFieldNames,
  fieldsMetaListPageForUserAssetAccount
} from '../../common'

export default {
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/acls/command-filter-acls/',
        permissions: {
          app: 'acls',
          resource: 'commandfilteracl'
        },
        columns: [
          'name',
          ...userAssetAccountFieldNames,
          'command_groups', 'action',
          'date_created', 'created_by', 'org_name',
          'comment', 'is_active', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name',
            ...userAssetAccountFieldNames,
            'command_groups', 'priority', 'is_active', 'comment', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'CommandFilterAclDetail'
            }
          },
          ...fieldsMetaListPageForUserAssetAccount,
          command_groups: {
            formatter: function(row) {
              return <span> { row.command_groups.length }</span>
            }
          },
          reviewers: {
            formatter: function(row) {
              return <span> { row.reviewers.length }</span>
            }
          }
        }
      },
      headerActions: {
        hasRightActions: true,
        hasExport: false,
        hasImport: false,
        hasRefresh: true,
        hasSearch: true,
        hasMoreActions: false,
        createRoute: 'CommandFilterAclCreate',
        canCreate: () => {
          return this.$hasPerm('acls.add_commandfilteracl')
        }
      }
    }
  },
  computed: {
  }
}
</script>

<style>

</style>
