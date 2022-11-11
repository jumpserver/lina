<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script type="text/jsx">
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/ops/tasks/',
        columns: [
          'name', 'display_name', 'queue', 'comment', 'count', 'state', 'last_published_time'
        ],
        columnsMeta: {
          name: {
            formatterArgs: {
              can: true
            }
          },
          display_name: {
            label: 'display_name',
            formatter: row => {
              return row.meta.display_name ? row.meta.display_name : '-'
            }
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
