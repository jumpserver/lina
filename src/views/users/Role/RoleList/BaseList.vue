<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { ListTable } from '@/components'

export default {
  components: {
    ListTable
  },
  props: {
    scope: {
      type: String,
      default: 'org'
    }
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/rbac/roles/',
        columns: [
          'name', 'builtin', 'created_by', 'date_create',
          'date_updated', 'comment', 'actions'
        ],
        columnsShow: {
          default: ['name', 'builtin', 'comment', 'actions'],
          min: ['name', 'action']
        },
        columnsMeta: {
        }
      },
      headerActions: {
      }
    }
  }
}
</script>

<style>

</style>
