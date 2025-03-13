<template>
  <div>
    <RecordViewSecret
      v-if="showViewSecretDialog"
      :url="secretUrl"
      :visible.sync="showViewSecretDialog"
    />
    <HomeCard ref="HomeCard" :table-config="tableConfig" class="failed-accounts" v-bind="cardConfig" />
  </div>
</template>

<script>
import HomeCard from '@/views/workbench/overview/components/HomeCard.vue'
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'
import RecordViewSecret from '@/components/Apps/ChangeSecret/RecordViewSecret.vue'

export default {
  components: {
    RecordViewSecret,
    HomeCard
  },
  props: {
    days: {
      type: [Number, String],
      default: '7'
    }
  },
  data() {
    const vm = this
    return {
      showViewSecretDialog: false,
      cardConfig: {
        title: this.$tc('ChangeSecretFailAccounts')
      },
      tableConfig: {
        url: `/api/v1/accounts/change-secret-records/dashboard/?days=${this.days}`,
        columns: [
          'asset', 'account', 'date_finished', 'is_success', 'error', 'actions'
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
            label: this.$t('Account'),
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
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              moreActionsTitle: this.$t('More'),
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('View'),
                  type: 'primary',
                  callback: ({ row }) => {
                    // debugger
                    vm.secretUrl = `/api/v1/accounts/change-secret-records/${row.id}/secret/`
                    vm.showViewSecretDialog = false
                    setTimeout(() => {
                      vm.showViewSecretDialog = true
                    })
                  }
                },
                {
                  name: 'Retry',
                  title: this.$t('Retry'),
                  can: this.$hasPerm('accounts.add_changesecretexecution'),
                  type: 'primary',
                  callback: ({ row }) => {
                    this.$axios.post(
                      '/api/v1/accounts/change-secret-records/execute/',
                      { record_ids: [row.id] }
                    ).then(res => {
                      openTaskPage(res['task'])
                    })
                  }
                },
                {
                  name: 'ignoreFail',
                  title: this.$t('IgnoreFail'),
                  can: this.$hasPerm('accounts.view_changesecretrecord'),
                  type: 'primary',
                  callback: ({ row }) => {
                    this.$axios.patch(
                      `/api/v1/accounts/change-secret-records/${row.id}/ignore-fail/`,
                    ).then(res => {
                      this.$message.success(this.$tc('UpdateSuccessMsg'))
                      this.$refs.HomeCard.$refs.ListTable.reloadTable()
                    })
                  }
                }
              ]
            }
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.failed-accounts {

  ::v-deep {
    .el-table {
      min-height: 260px;
    }
  }
}
</style>
