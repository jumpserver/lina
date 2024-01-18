<template>
  <div>
    <GenericListPage
      v-loading="loading"
      :header-actions="headerActions"
      :table-config="tableConfig"
    />
    <DiffDetail ref="DetailDialog" :title="$tc('route.OperateLog')" />
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
      url: '/api/v1/audits/operate-logs/',
      rowObj: {
        diff: ''
      },
      logDetailVisible: false,
      loading: false,
      tableConfig: {
        url: '/api/v1/audits/operate-logs/',
        columnsShow: {
          min: ['user', 'resource'],
          default: [
            'user', 'action_display', 'resource_type_display',
            'resource', 'remote_addr', 'datetime', 'action',
            'resource_type', 'actions'
          ]
        },
        columnsMeta: {
          resource_type: {
            width: '180px'
          },
          datetime: {
            width: '160px'
          },
          remote_addr: {
            width: '140px'
          },
          action_display: {
            width: '70px'
          },
          actions: {
            width: '70px',
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              canUpdate: false,
              hasDelete: false,
              canDelete: false,
              hasClone: false,
              canClone: false,
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('common.View'),
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
        hasDatePicker: true
      }
    }
  }
}
</script>

<style>

</style>
