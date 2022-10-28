<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  name: 'AccountBackupPlanList',
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/account-templates/',
        columns: ['name', 'username', 'privileged', 'actions'],
        columnsShow: {
          min: ['name', 'actions']
        },
        columnsMeta: {
          privileged: {
            width: '100px'
          }
        }
      },
      headerActions: {
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasMoreActions: false,
        createRoute: () => {
          return {
            name: 'AccountTemplateCreate'
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
