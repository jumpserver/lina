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
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/assets/admin-users/',
        permissions: {
          resource: 'systemuser'
        },
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
              onUpdate: ({ row }) => {
                vm.$router.push({
                  name: 'SystemUserUpdate',
                  params: { id: row.id },
                  query: { protocol: row.protocol, type: 'admin' }
                })
              },
              onClone: ({ row }) => {
                vm.$router.push({
                  name: 'SystemUserCreate',
                  query: { protocol: row.protocol, type: 'admin', clone_from: row.id }
                })
              }
            }
          }
        }
      },
      headerActions: {
        searchConfig: {
          getUrlQuery: false
        },
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
