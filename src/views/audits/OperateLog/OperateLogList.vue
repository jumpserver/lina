<template>
  <div>
    <div v-loading="loading">
      <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
    </div>
    <DiffDetail ref="DetailDialog" :title="$tc('OperateLog')" />
  </div>
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { ActionsFormatter } from '@/components/Table/TableFormatters'
import OverflowTooltipFormatter from '@/components/Table/TableFormatters/OverflowTooltipFormatter.vue'
import DiffDetail from '@/components/Dialog/DiffDetail'
import { translateOperateLogText } from './translate'

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
            'user',
            'action_display',
            'resource_type_display',
            'resource',
            'remote_addr',
            'datetime',
            'action',
            'resource_type',
            'actions'
          ]
        },
        columnsMeta: {
          user: {
            label: this.$t('User'),
            minWidth: '120px'
          },
          resource: {
            width: '200px',
            formatter: OverflowTooltipFormatter,
            formatterArgs: {
              getText: ({ row }) => translateOperateLogText(row.resource)
            }
          },
          resource_type: {
            formatter: (row) => translateOperateLogText(row.resource_type)
          },
          resource_type_display: {
            formatter: (row) => translateOperateLogText(row.resource_type_display)
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
                    this.$axios
                      .get(`/api/v1/audits/operate-logs/${row.id}/?type=action_detail`)
                      .then((res) => {
                        this.$refs.DetailDialog.show(res.diff)
                      })
                      .finally(() => {
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
        hasReportExport: true,
        hasDatePicker: true,
        searchConfig: {
          getUrlQuery: true,
          fieldLabels: {
            user: this.$t('User')
          }
        }
      }
    }
  }
}
</script>

<style></style>
