<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, ActionsFormatter } from '@/components/DataTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/system-users/',
        columns: [
          {
            prop: 'name',
            label: this.$t('common.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'SystemUserDetail'
          },
          {
            prop: 'username',
            label: this.$t('common.username')
          },
          {
            prop: 'protocol',
            label: this.$t('assets.protocol')
          },
          {
            prop: 'login_mode_display',
            label: this.$t('assets.loginMode')
          },
          {
            prop: 'assets_amount',
            label: this.$t('assets.asset')
          },
          {
            prop: 'comment',
            label: this.$t('assets.comment')
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
        createRoute: 'SystemUserCreate'
      }
    }
  }
}
</script>

<style>

</style>
