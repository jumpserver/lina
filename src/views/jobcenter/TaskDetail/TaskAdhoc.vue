<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
import { LengthFormatter } from '@/components/ListTable/formatters'
import { toSafeLocalDateStr } from '@/utils/common'
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
            label: this.$t('jobcenter.version')
          },
          hosts: {
            label: this.$t('jobcenter.hosts'),
            formatter: LengthFormatter,
            showOverflowTooltip: true
          },
          pattern: {
            label: this.$t('jobcenter.pattern')
          },
          run_as: {
            label: this.$t('jobcenter.runAs'),
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
            label: this.$t('jobcenter.become')
          },
          date_created: {
            label: this.$t('jobcenter.datetime'),
            formatter: function(row) {
              return toSafeLocalDateStr(row.date_created)
            }
          },
          actions: {
            prop: 'id',
            actions: {
              hasEdit: false,
              hasDelete: false,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'detail',
                  title: this.$t('jobcenter.detail'),
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
