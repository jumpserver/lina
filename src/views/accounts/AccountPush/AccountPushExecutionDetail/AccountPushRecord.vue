<template>
  <div>
    <RecordViewSecret
      v-if="showViewSecretDialog"
      :url="secretUrl"
      :visible.sync="showViewSecretDialog"
    />
    <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable/index.vue'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import RecordViewSecret from '@/components/Apps/ChangeSecret/RecordViewSecret.vue'

export default {
  name: 'AccountPushRecord',
  components: {
    RecordViewSecret,
    GenericListTable
  },
  props: {
    object: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data() {
    return {
      secretUrl: '',
      showViewSecretDialog: false,
      tableConfig: {
        url: '/api/v1/accounts/push-account-records/',
        columns: [
          'asset', 'account', 'date_finished', 'is_success', 'error'
        ],
        columnsMeta: {
          asset: {
            label: this.$t('Asset'),
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
            label: this.$t('Username'),
            formatter: DetailFormatter,
            formatterArgs: {
              can: this.$hasPerm('accounts.view_account'),
              getTitle({ row }) {
                return row.account.username
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
            label: this.$t('Success'),
            formatter: (row) => {
              if (row.status === 'pending') {
                return <i Class='fa  fa fa-spinner fa-spin'/>
              }
              if (row.is_success) {
                return <i Class='fa fa-check text-primary'/>
              }
              return <i Class='fa fa-times text-danger'/>
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
        hasBulkUpdate: false,
        searchConfig: {
          exclude: ['id', 'status', 'execution'],
          options: [
            {
              label: this.$t('Asset'),
              value: 'asset_name'
            },
            {
              label: this.$t('Accounts'),
              value: 'account_username'
            },
            {
              value: 'status',
              label: this.$t('Status'),
              type: 'choice',
              children: [
                {
                  default: true,
                  value: 'success',
                  label: this.$t('Success')
                },
                {
                  value: 'failed',
                  label: this.$t('Failed')
                }
              ]
            },
            {
              label: this.$t('Execution'),
              value: 'execution_id'
            }
          ]
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
