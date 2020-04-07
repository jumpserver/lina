<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { ActionsFormatter } from '@/components/DataTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/gateways/?domain=' + this.$route.params.id,
        columns: [
          {
            prop: 'name',
            label: this.$t('assets.name'),
            sortable: 'custom'
          },
          {
            prop: 'ip',
            label: this.$t('assets.ip'),
            sortable: 'custom'
          },
          {
            prop: 'port',
            label: this.$t('assets.port'),
            sortable: 'custom'
          },
          {
            prop: 'protocol',
            label: this.$t('assets.protocol'),
            sortable: true
          },
          {
            prop: 'username',
            label: this.$t('assets.username'),
            sortable: 'custom'
          },
          {
            prop: 'comment',
            label: this.$t('assets.comment'),
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
        createRoute: 'DomainCreate'
      }
    }
  },
  created() {
    console.log('111111')
    console.log('/api/v1/assets/gateways/?domain=' + this.$route.params.id)
  }
}
</script>

<style>

</style>
