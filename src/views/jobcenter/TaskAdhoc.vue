<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
import { ActionsFormatter, LengthFormatter } from '@/components/ListTable/formatters/index'
import { toSafeLocalDateStr } from '@/utils/common'
export default {
  name: 'TaskAdhoc',
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/ops/adhoc/?task=${this.$route.params.id}`,
        columns: [
          'short_id', 'hosts', 'pattern', 'run_as', 'become_display', 'date_created', 'actions'
        ],
        columnsMeta: {
          short_id: {
            label: this.$t('jobcenter.Version')
          },
          hosts: {
            label: this.$t('jobcenter.Hosts'),
            formatter: LengthFormatter,
            showOverflowTooltip: true
          },
          pattern: {
            label: this.$t('jobcenter.Pattern')
          },
          run_as: {
            label: this.$t('jobcenter.RunAs'),
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
            label: this.$t('jobcenter.Become')
          },
          date_created: {
            label: this.$t('jobcenter.Datetime'),
            formatter: function(row) {
              return toSafeLocalDateStr(row.date_created)
            }
          },
          actions: {
            prop: 'id',
            abel: this.$tc('Action'),
            formatter: ActionsFormatter,
            actions: {
              hasEdit: false,
              hasDelete: false,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'detail',
                  title: '详情',
                  type: 'primary',
                  callback: function({ cellValue, tableData }) {
                    return this.$router.push({ name: 'AdhocDetail', params: { id: cellValue }})
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: false,
        hasSearch: false,
        hasRightActions: false
      }
    }
  }
}
</script>

<style scoped>

</style>
