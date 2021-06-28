<template>
  <div>
    <el-alert v-if="helpMessage" type="success">
      <span v-html="helpMessage" />
    </el-alert>
    <GenericListTable :table-config="tableConfig" :header-actions="headerActions" :help-message="helpMessage" />
  </div>
</template>

<script>
import { GenericListTable } from '@/layout/components'

export default {
  components: {
    GenericListTable
  },
  data() {
    return {
      helpMessage: this.$t('assets.AdminUserListHelpMessage'),
      tableConfig: {
        url: '/api/v1/assets/admin-users/',
        columns: [
          'name', 'username', 'assets_amount', 'comment',
          'created_by', 'date_created', 'date_updated', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'username', 'assets_amount', 'comment', 'actions']
        },
        columnsMeta: {
          username: {
            showOverflowTooltip: true
          },
          assets_amount: {
            width: '80px'
          }
        }
      },
      headerActions: {
        createRoute: 'AdminUserCreate',
        updateRoute: 'AdminUserUpdate'
      }
    }
  }
}
</script>

<style>

</style>
