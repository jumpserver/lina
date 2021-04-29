<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
import { toSafeLocalDateStr } from '@/utils/common'
import { DetailFormatter } from '@/components/TableFormatters'
export default {
  name: 'TaskAdhoc',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/ops/adhoc/?task=${this.object.id}`,
        columns: [
          'short_id', 'hosts', 'pattern', 'run_as', 'become_display', 'date_created', 'actions'
        ],
        columnsMeta: {
          short_id: {
            label: this.$t('ops.version'),
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AdhocDetail'
            }
          },
          hosts: {
            label: this.$t('ops.hosts'),
            width: '80px',
            formatter: (row, column, cellValue) => {
              if (cellValue instanceof Array) {
                return cellValue.length
              }
              return cellValue
            },
            showOverflowTooltip: true
          },
          pattern: {
            label: this.$t('ops.pattern'),
            width: '80px'
          },
          run_as: {
            label: this.$t('ops.runAs'),
            formatter: function(row) {
              if (row.run_as_admin) {
                return 'Admin'
              }
              if (row.run_as) {
                return row.run_as
              }
            }
          },
          become_display: {
            label: this.$t('ops.become')
          },
          date_created: {
            label: this.$t('ops.datetime'),
            formatter: function(row) {
              return toSafeLocalDateStr(row.date_created)
            }
          },
          actions: {
            prop: 'id',
            width: '80px',
            formatterArgs: {
              hasEdit: false,
              hasDelete: false,
              hasUpdate: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'detail',
                  title: this.$t('ops.detail'),
                  type: 'primary',
                  callback: function({ row, tableData }) {
                    return this.$router.push({ name: 'AdhocDetail', params: { id: row.id }})
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasRightActions: false
      }
    }
  }
}
</script>

<style scoped>

</style>
