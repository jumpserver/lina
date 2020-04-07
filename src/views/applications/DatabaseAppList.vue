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
        url: '/api/v1/applications/database-apps/',
        columns: [
          {
            prop: 'name',
            label: this.$t('applications.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'DatabaseAppDetail'
          },
          {
            prop: 'get_type_display',
            label: this.$t('applications.appType'),
            sortable: 'custom'
          },
          {
            prop: 'host',
            label: this.$t('applications.host'),
            sortable: 'custom'
          },
          {
            prop: 'port',
            label: this.$t('applications.port'),
            sortable: 'custom'
          },
          {
            prop: 'database',
            label: this.$t('applications.database'),
            sortable: 'custom'
          },
          {
            prop: 'comment',
            label: this.$t('applications.comment'),
            sortable: 'custom'
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
        createRoute: 'DatabaseAppCreate'
      }
    }
  }
}
</script>

<style>

</style>
