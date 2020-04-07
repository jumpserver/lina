<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, ActionsFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage,
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/ops/tasks/',
        columns: [
          {
            prop: 'name',
            label: this.$tc('Name'),
            formatter: DetailFormatter,
            sortable: 'custom',
            route: 'UserDetail'
          },
          {
            prop: 'latest_execution',
            label: this.$t('jobcenter.RunTimes')
          },
          {
            prop: 'latest_execution.hosts_amount',
            label: this.$t('jobcenter.hosts')
          },
          {
            prop: 'latest_execution.is_success',
            label: this.$t('jobcenter.success')
          },
          {
            prop: 'latest_execution.date_start',
            label: this.$t('jobcenter.date'),
            sortable: 'custom'
          },
          {
            prop: 'latest_execution.timedelta',
            label: this.$t('jobcenter.time')
          },
          {
            prop: 'id',
            label: this.$tc('Action'),
            align: 'center',
            formatter: ActionsFormatter,
            actions: {
              hasUpdate: (row, cellValue) => {
                return false
              },
              canUpdate: (row, cellValue) => {
                console.log('On table update')
                return false
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
        // 写路由名字，table组件会自动传作为参数
        tableActions: {
          editRoute: '404'
        }
      },
      headerActions: {
        hasDelete: false,
        hasUpdate: false,
        hasCreate: false
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
