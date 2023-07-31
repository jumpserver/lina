<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { DetailFormatter } from '@/components/Table/TableFormatters'

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
        url: `/api/v1/accounts/change-secret-records/?execution_id=${this.object.id}`,
        columns: [
          'asset', 'account', 'date_finished', 'is_success', 'error'
        ],
        columnsMeta: {
          asset: {
            label: this.$t('accounts.AccountChangeSecret.Asset'),
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
              can: this.$hasPerm('accounts.view_account'),
              getTitle({ row }) {
                return row.account.name
              },
              getRoute({ row }) {
                return {
                  name: 'AssetAccountDetail',
                  params: { id: row.account.id }
                }
              }
            }
          },
          is_success: {
            label: this.$t('accounts.AccountChangeSecret.Success')
          },
          timedelta: {
            label: this.$t('accounts.AccountChangeSecret.TimeDelta'),
            width: '90px',
            formatter: function(row) {
              return row.timedelta ? row.timedelta.toFixed(2) + 's' : 0
            }
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
