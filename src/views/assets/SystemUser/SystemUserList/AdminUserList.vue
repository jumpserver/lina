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
      tableConfig: {
        url: '/api/v1/assets/system-users/?type=admin',
        columns: [
          'name', 'username', 'assets_amount',
          'created_by', 'date_created', 'date_updated', 'comment', 'org_name', 'actions'
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
          },
          actions: {
            formatterArgs: {
              updateRoute: { name: 'SystemUserUpdate', query: { type: 'admin' }},
              cloneRoute: { name: 'SystemUserCreate', query: { type: 'admin' }}
            }
          }
        }
      },
      headerActions: {
        createRoute: () => {
          return {
            name: 'SystemUserCreate',
            query: {
              type: 'admin'
            }
          }
        }
      },
      helpMessage: this.$t('assets.AdminUserListHelpMessage')
    }
  }
}
</script>

<style>

</style>
