<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script type="text/jsx">
import { GenericListPage } from '@/layout/components'
import { ActionsFormatter } from '@/components/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/ops/tasks/',
        columns: [
          'name', 'queue', 'count', 'state', 'comment', 'last_published_time', 'actions'
        ],
        columnsMeta: {
          name: {
            formatterArgs: {
              can: true
            }
          },
          queue: {
            width: '120px',
            label: this.$t('ops.Queue'),
            formatter: (row) => {
              return row.meta.queue
            }
          },
          comment: {
            width: '300px',
            label: this.$t('common.Comment'),
            formatter: row => {
              return row.meta.comment ? row.meta.comment : '-'
            }
          },
          last_published_time: {
            label: this.$t('ops.LastPublishedTime'),
            width: '210px',
            formatter: (row) => {
              return row.last_published_time != null ? row.last_published_time : '-'
            }
          },
          count: {
            width: '80px',
            label: `${this.$t('ops.success')}/${this.$t('ops.total')}`,
            formatter: (row) => {
              return <div>
                <span Class='text-primary'>{row.summary.success}</span>/
                <span>{row.summary.total}</span>
              </div>
            }
          },
          state: {
            label: this.$t('ops.State'),
            width: '60px',
            align: 'center',
            formatter: (row) => {
              switch (row.state) {
                case 'green':
                  return <i Class='fa  fa-circle-o text-primary'/>
                case 'yellow':
                  return <i Class='fa fa-circle-o text-warning'/>
                case 'red':
                  return <i Class='fa fa-circle-o text-danger'/>
              }
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              hasClone: false,
              canDelete: this.$hasPerm('ops.delete_celerytask'),
              extraActions: [
                {
                  name: 'connect',
                  type: 'primary',
                  title: this.$t('ops.Execute'),
                  can: this.$hasPerm('ops.view_celerytaskexecution'),
                  callback: ({ row }) => {
                    openTaskPage(row.id)
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasRightActions: false,
        hasLeftActions: false
      }
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
