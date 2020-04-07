<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, ActionsFormatter, ChoicesFormatter } from '@/components/DataTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/perms/remote-app-permissions/',
        columns: [
          {
            prop: 'name',
            label: this.$t('perms.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'RemoteAppPermissionDetail'
          },
          {
            prop: 'users.length',
            label: this.$t('perms.user')
          },
          {
            prop: 'user_groups.length',
            label: this.$t('perms.userGroup')
          },
          {
            prop: 'remote_apps.length',
            label: this.$t('perms.RemoteApp')
          },
          {
            prop: 'system_users.length',
            label: this.$t('perms.systemUser')
          },
          {
            prop: 'is_valid',
            label: this.$t('perms.validity'),
            formatter: ChoicesFormatter,
            align: 'center',
            width: '80px'
          },
          {
            prop: 'id',
            label: this.$tc('Action'),
            align: 'center',
            formatter: ActionsFormatter,
            actions: {
              hasUpdate: (row, cellValue) => {
                return true
              },
              canUpdate: (row, cellValue) => {
                console.log('On table update')
                return true
              },
              hasDelete: true,
              canDelete: (row, cellValue) => {
                return true
              },
              onDelete: (row, cellValue) => {
                this.$confirm('你好啊', '提示', {
                  type: 'warning',
                  confirmButtonClass: 'el-button--danger',
                  beforeClose: async(action, instance, done) => {
                  }
                }).catch(() => {
                  /* 取消*/
                })
              },
              order: []
            }
          }
        ],
        tableActions: {
          hasEdit: true,
          editRoute: '404'
        }
      },
      headerActions: {
        hasDelete: false,
        hasUpdate: false,
        createRoute: 'RemoteAppPermissionCreate'
      }
    }
  }
}
</script>

<style>

</style>
