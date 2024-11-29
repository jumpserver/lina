<template>
  <div>
    <GenericListPage
      v-loading="loading"
      :header-actions="headerActions"
      :table-config="tableConfig"
    />
    <DiffDetail ref="DetailDialog" :title="$tc('OperateLog')" />
  </div>
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { ActionsFormatter } from '@/components/Table/TableFormatters'
import DiffDetail from '@/components/Dialog/DiffDetail'

export default {
  components: {
    GenericListPage,
    DiffDetail
  },
  data() {
    const vm = this
    return {
      rowObj: {
        diff: ''
      },
      logDetailVisible: false,
      loading: false,
      tableConfig: {
        url: '/api/v1/audits/operate-logs/?resource_type=Account',
        columnsShow: {
          min: ['user', 'resource'],
          default: [
            'user', 'action_display', 'resource', 'remote_addr', 'datetime', 'action', 'actions'
          ]
        },
        columnsMeta: {
          user: {
            'min-width': '120px'
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('View'),
                  type: 'primary',
                  callback: ({ row }) => {
                    vm.loading = true
                    this.$axios.get(
                      `/api/v1/audits/operate-logs/${row.id}/?type=action_detail`
                    ).then(res => {
                      this.$refs.DetailDialog.show(res.diff)
                    }).finally(() => {
                      vm.loading = false
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasDatePicker: true,
        searchConfig: {
          exclude: ['resource_type']
        }
      }
    }
  }
}
</script>

<style>

</style>
