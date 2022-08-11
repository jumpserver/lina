<template>
  <div>
    <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="title" />
    <ShowSecretInfo v-if="showViewSecretDialog" :visible.sync="showViewSecretDialog" :account="account" />
  </div>
</template>

<script>
import { ActionsFormatter, DetailFormatter } from '@/components/TableFormatters'
import ShowSecretInfo from '../AccountListTable/ShowSecretInfo'
import { GenericListPage } from '@/layout/components'

export default {
  name: 'AccountHistoryTable',
  components: {
    GenericListPage,
    ShowSecretInfo
  },
  props: {
    url: {
      type: String,
      required: true
    },
    exportUrl: {
      type: String,
      default() {
        return this.url.replace('/assets/accounts-history/', '/assets/account-history-secrets/')
      }
    },
    hasLeftActions: {
      type: Boolean,
      default: false
    },
    otherActions: {
      type: Array,
      default: null
    },
    hasClone: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const vm = this
    return {
      showViewSecretDialog: false,
      account: {},
      tableConfig: {
        url: this.url,
        permissions: {
          app: 'assets',
          resource: 'authbook'
        },
        columns: [
          'asset_name', 'ip', 'username', 'version',
          'systemuser', 'date_created', 'date_updated', 'actions'
        ],
        columnsShow: {
          min: ['username', 'actions'],
          default: ['hostname', 'ip', 'username', 'version', 'actions']
        },
        columnsMeta: {
          asset_name: {
            prop: 'asset_name',
            label: this.$t('assets.Name'),
            showOverflowTooltip: true,
            formatter: DetailFormatter,
            formatterArgs: {
              can: this.$hasPerm('assets.view_asset'),
              getRoute({ row }) {
                return {
                  name: 'AssetDetail',
                  params: { id: row.asset }
                }
              }
            }
          },
          ip: {
            width: '120px'
          },
          username: {
            showOverflowTooltip: true
          },
          version: {
            width: '70px'
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false, // can set function(row, value)
              hasDelete: false, // can set function(row, value)
              hasClone: this.hasClone,
              moreActionsTitle: this.$t('common.More'),
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('common.View'),
                  can: this.$hasPerm('assets.view_assethistoryaccountsecret'),
                  type: 'primary',
                  callback: ({ row }) => {
                    vm.account = row
                    vm.showViewSecretDialog = true
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: this.hasLeftActions,
        hasMoreActions: false,
        hasCreate: false,
        hasImport: false,
        hasExport: this.$hasPerm('assets.view_assethistoryaccountsecret'),
        exportOptions: {
          url: this.exportUrl,
          mfaVerifyRequired: true
        },
        searchConfig: {
          exclude: ['systemuser', 'asset']
        },
        hasSearch: true
      }
    }
  },
  computed: {
    title() {
      return this.$t('accounts.AccountHistableHelpMessage')
    }
  },
  watch: {
    url(iNew) {
      this.$set(this.tableConfig, 'url', iNew)
      this.$set(this.headerActions.exportOptions, 'url', iNew.replace('/accounts-history/', '/account-history-secrets/'))
    }
  },
  mounted() {
    if (this.otherActions) {
      const actionColumn = this.tableConfig.columns[this.tableConfig.columns.length - 1]
      for (const item of this.otherActions) {
        actionColumn.formatterArgs.extraActions.push(item)
      }
    }
  },
  methods: {
  }
}
</script>

<style lang='less' scoped>

</style>
