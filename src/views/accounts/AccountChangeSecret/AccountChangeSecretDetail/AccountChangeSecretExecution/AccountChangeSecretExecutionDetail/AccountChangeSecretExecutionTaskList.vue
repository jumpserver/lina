<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { DetailFormatter } from '@/components/TableFormatters'

export default {
  name: 'AccountChangeSecretExecutionTaskList',
  components: {
    GenericListTable
  },
  props: {
    object: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/assets/change-secret-records/?execution_id=${this.object.id}`,
        columns: [
          'asset', 'account', 'date_started', 'date_finished', 'timedelta', 'status', 'error'
        ],
        columnsMeta: {
          asset: {
            label: this.$t('xpack.ChangeAuthPlan.Asset'),
            formatter: DetailFormatter,
            formatterArgs: {
              can: this.$hasPerm('assets.view_asset'),
              getTitle({ row }) {
                return row.asset.name
              },
              getRoute({ row }) {
                return {
                  name: 'AssetDetail',
                  params: { id: row.asset.id }
                }
              }
            }
          },
          account: {
            label: this.$t('users.Username'),
            formatter: DetailFormatter,
            formatterArgs: {
              can: this.$hasPerm('assets.view_account'),
              getTitle({ row }) {
                return row.account.name
              },
              getRoute({ row }) {
                return {
                  name: 'AssetDetail',
                  params: { id: row.account.id }
                }
              }
            }
          },
          is_success: {
            label: this.$t('xpack.ChangeAuthPlan.Success')
          },
          timedelta: {
            label: this.$t('xpack.ChangeAuthPlan.TimeDelta'),
            width: '90px',
            formatter: function(row) {
              return row.timedelta.toFixed(2) + 's'
            }
          },
          reason_display: {
            label: this.$t('xpack.AccountBackupPlan.Reason')
          }
        }
      },
      headerActions: {
        hasSearch: true,
        hasRefresh: true,
        hasLeftActions: true,
        hasRightActions: true,
        hasExport: false,
        hasImport: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false
      }
    }
  }
}
</script>

<style scoped>

</style>
