<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script type="text/jsx">
// import { timeOffset, toSafeLocalDateStr } from '@/utils/common'
import { GenericListPage } from '@/layout/components'
// import { openTaskPage } from '@/utils/jms'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/ops/tasks/',
        columns: [
          'name', 'queue', 'comment', 'count', 'state', 'last_published_time'
        ],
        columnsMeta: {
          name: {
            formatterArgs: {
              can: true
            }
            // formatter: (row) => {
            //   return row.meta.verbose_name != null ? row.meta.verbose_name : row.name
            // }
          },
          comment: {
            label: 'comment',
            formatter: (row) => {
              return row.meta.comment
            }
          },
          queue: {
            label: 'queue',
            formatter: (row) => {
              return row.meta.queue
            }
          },
          last_published_time: {
            width: '210px',
            formatter: (row) => {
              return row.last_published_time != null ? row.last_published_time : '-'
            }
          },
          count: {
            label: 'success/total',
            width: '120px',
            formatter: (row) => {
              return <div>
                <span Class='text-primary'>{row.success_count}</span>/
                <span>{row.publish_count}</span>
              </div>
            }
          },
          state: {
            width: '60px',
            align: 'center',
            formatter: (row) => {
              switch (row.state) {
                case 'green':
                  return <i Class='fa  fa-circle-o text-primary' />
                case 'yellow':
                  return <i Class='fa fa-circle-o text-warning' />
                case 'red':
                  return <i Class='fa fa-circle-o text-danger' />
              }
            }
          },
          // runtimes: {
          //   label: this.$t('ops.runTimes'),
          //   width: '120px',
          //   formatter: function(row) {
          //     return (<div>
          //       <span Class='text-primary'>{row.summary.success}</span>/
          //       <span Class='text-danger'>{row.summary.failed}</span>/
          //       <span>{row.summary.total}</span>
          //     </div>)
          //   }
          // },
          // host_amount: {
          //   label: this.$t('ops.hosts'),
          //   width: '65px',
          //   formatter: function(row) {
          //     return _.get(row, 'latest_execution.hosts_amount', 0)
          //   }
          // },
          // is_success: {
          //   label: this.$t('ops.success'),
          //   align: 'center',
          //   width: '80px',
          //   formatter: row => {
          //     if (_.get(row, 'latest_execution.is_success', false)) {
          //       return <i Class='fa fa-check text-primary'/>
          //     }
          //     return <i Class='fa fa-times text-danger'/>
          //   }
          // },
          // date_start: {
          //   label: this.$t('ops.date'),
          //   width: '150px',
          //   formatter: function(row) {
          //     if (_.get(row, 'latest_execution.date_start', false)) {
          //       return toSafeLocalDateStr(row.latest_execution.date_start)
          //     }
          //     return ''
          //   }
          // },
          // time: {
          //   label: this.$t('ops.time'),
          //   width: '100px',
          //   formatter: function(row) {
          //     if (_.get(row, 'latest_execution.date_start', false)) {
          //       return timeOffset(row.latest_execution.date_start, row.latest_execution.date_finished)
          //     }
          //     return ''
          //   }
          // },
          actions: {
            prop: 'id',
            formatterArgs: {
              // hasUpdate: false,
              // hasClone: false,
              // canDelete: this.$hasPerm('ops.delete_task'),
              // onDelete: function({ row, col, cellValue, reload }) {
              //   const msg = this.$t('common.deleteWarningMsg') + ` "${row.display_name || row.name}" ` + '?'
              //   const title = this.$t('common.Info')
              //   this.$alert(msg, title, {
              //     type: 'warning',
              //     confirmButtonClass: 'el-button--danger',
              //     showCancelButton: true,
              //     beforeClose: async(action, instance, done) => {
              //       if (action !== 'confirm') return done()
              //       instance.confirmButtonLoading = true
              //       try {
              //         await performDelete.bind(this)({ row: row, col: col })
              //         done()
              //         reload()
              //         this.$message.success(this.$t('common.deleteSuccessMsg'))
              //       } finally {
              //         instance.confirmButtonLoading = false
              //       }
              //     }
              //   })
              // },
              // extraActions: [
              //   {
              //     name: 'run',
              //     can: this.$hasPerm('ops.add_adhoc'),
              //     title: this.$t('ops.run'),
              //     type: 'primary',
              //     callback: function({ row, tableData }) {
              //       this.$axios.get(
              //         `/api/v1/ops/tasks/${row.id}/run/`
              //       ).then(res => {
              //         openTaskPage(res['task'])
              //       })
              //     }
              //   }
              // ]
            }
          }
        }
      },
      headerActions: {
        hasRightActions: false,
        hasCreate: false
      }
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
