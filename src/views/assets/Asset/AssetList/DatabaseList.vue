<template>
  <BaseList
    :category="'database'"
    :table-config="tableConfig"
    :header-actions="headerActions"
  />
</template>

<script>
import BaseList from './components/BaseList'

export default {
  components: {
    BaseList
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/databases/',
        columns: [
          'name', 'ip', 'public_ip', 'admin_user_display',
          'protocols', 'category', 'type', 'platform', 'sn',
          'is_active', 'connectivity', 'labels_display',
          'created_by', 'date_created', 'comment', 'org_name', 'actions'
        ],
        columnsMeta: {
          platform: {
            sortable: false
          }
        }
      },
      headerActions: {
        createRoute: 'DatabaseCreate'
      }
    }
  }
}
</script>

<style>

</style>
