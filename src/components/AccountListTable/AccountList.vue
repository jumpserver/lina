<template>
  <div>
    <ListTable ref="ListTable" :header-actions="headerActions" :table-config="tableConfig" />
    <ViewSecret
      v-if="showViewSecretDialog"
      :account="account"
      :url="secretUrl"
      :visible.sync="showViewSecretDialog"
    />
    <UpdateSecretInfo
      v-if="showUpdateSecretDialog"
      :account="account"
      :visible.sync="showUpdateSecretDialog"
      @updateAuthDone="onUpdateAuthDone"
    />
    <AccountCreateUpdate
      v-if="showAddDialog"
      :account="account"
      :asset="iAsset"
      :title="accountCreateUpdateTitle"
      :visible.sync="showAddDialog"
      @add="addAccountSuccess"
    />
  </div>
</template>

<script>
import ListTable from '@/components/ListTable/index'
import { ActionsFormatter } from '@/components/TableFormatters'
import ViewSecret from './ViewSecret'
import UpdateSecretInfo from './UpdateSecretInfo'
import AccountCreateUpdate from './AccountCreateUpdate'
import { connectivityMeta } from './const'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AccountListTable',
  components: {
    ListTable,
    UpdateSecretInfo,
    ViewSecret,
    AccountCreateUpdate
  },
  props: {
    url: {
      type: String,
      required: true
    },
    exportUrl: {
      type: String,
      default() {
        return this.url.replace('/accounts/accounts/', '/accounts/account-secrets/')
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
    },
    asset: {
      type: Object,
      default: null
    },
    columns: {
      type: Array,
      default: () => []
    },
    hasExport: {
      type: Boolean,
      default: true
    },
    hasImport: {
      type: Boolean,
      default: true
    },
    columnsMeta: {
      type: Object,
      default: () => {
      }
    },
    headerExtraActions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const vm = this
    return {
      showViewSecretDialog: false,
      showUpdateSecretDialog: false,
      showAddDialog: false,
      accountCreateUpdateTitle: this.$t('assets.AddAccount'),
      iAsset: this.asset,
      account: {},
      secretUrl: '',
      tableConfig: {
        url: this.url,
        permissions: {
          app: 'assets',
          resource: 'account'
        },
        columnsExclude: ['spec_info'],
        columns: [
          'name', 'username', 'asset', 'privileged',
          'secret_type', 'source', 'actions'
        ],
        columnsMeta: {
          name: {
            formatter: function(row) {
              const to = {
                name: 'AssetAccountDetail',
                params: { id: row.id }
              }
              if (vm.$hasPerm('accounts.view_account')) {
                return <router-link to={to}>{row.name}</router-link>
              } else {
                return <span>{row.name}</span>
              }
            }
          },
          asset: {
            label: this.$t('assets.Asset'),
            formatter: function(row) {
              const to = {
                name: 'AssetDetail',
                params: { id: row.asset.id }
              }
              if (vm.$hasPerm('assets.view_asset')) {
                return <router-link to={to}>{row.asset.name}</router-link>
              } else {
                return <span>{row.asset.name}</span>
              }
            }
          },
          secret_type: {
            width: '100px',
            formatter: function(row) {
              return row.secret_type.label
            }
          },
          source: {
            formatter: function(row) {
              return row.source.label
            }
          },
          has_secret: {
            width: '100px',
            formatterArgs: {
              showFalse: false
            }
          },
          privileged: {
            label: this.$t('assets.Privileged'),
            width: '120px',
            formatterArgs: {
              showText: false,
              showFalse: false
            }
          },
          connectivity: connectivityMeta,
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
                  can: this.$hasPerm('accounts.view_accountsecret'),
                  type: 'primary',
                  callback: ({ row }) => {
                    // debugger
                    vm.secretUrl = `/api/v1/accounts/account-secrets/${row.id}/`
                    vm.account = row
                    vm.showViewSecretDialog = false
                    setTimeout(() => {
                      vm.showViewSecretDialog = true
                    })
                  }
                },
                {
                  name: 'Delete',
                  title: this.$t('common.Delete'),
                  can: this.$hasPerm('accounts.delete_account'),
                  type: 'primary',
                  callback: ({ row }) => {
                    this.$axios.delete(`/api/v1/accounts/accounts/${row.id}/`).then(() => {
                      this.$message.success(this.$tc('common.deleteSuccessMsg'))
                      this.$refs.ListTable.reloadTable()
                    })
                  }
                },
                {
                  name: 'Test',
                  title: this.$t('common.Test'),
                  can: ({ row }) =>
                    !this.$store.getters.currentOrgIsRoot &&
                    this.$hasPerm('accounts.change_account') &&
                    row.asset['auto_info'].ansible_enabled &&
                    row.asset['auto_info'].ping_enabled,
                  callback: ({ row }) => {
                    this.$axios.post(
                      `/api/v1/accounts/accounts/tasks/`,
                      { action: 'verify', accounts: [row.id] }
                    ).then(res => {
                      openTaskPage(res['task'])
                    })
                  }
                },
                {
                  name: 'Update',
                  title: this.$t('common.Update'),
                  can: this.$hasPerm('accounts.change_account') && !this.$store.getters.currentOrgIsRoot,
                  callback: ({ row }) => {
                    const data = {
                      ...this.asset,
                      ...row.asset
                    }
                    vm.account = row
                    vm.iAsset = data
                    vm.showAddDialog = false
                    vm.accountCreateUpdateTitle = this.$t('assets.UpdateAccount')
                    setTimeout(() => {
                      vm.showAddDialog = true
                    })
                  }
                }
              ]
            }
          },
          ...this.columnsMeta
        }
      },
      headerActions: {
        hasLeftActions: this.hasLeftActions,
        hasMoreActions: true,
        hasCreate: false,
        hasImport: this.hasImport,
        hasExport: this.hasExport && this.$hasPerm('accounts.view_accountsecret'),
        handleImportClick: ({ selectedRows }) => {
          this.$eventBus.$emit('showImportDialog', {
            selectedRows,
            url: '/api/v1/accounts/accounts/',
            name: this?.name
          })
        },
        exportOptions: {
          url: this.exportUrl,
          mfaVerifyRequired: true
        },
        importOptions: {
          canImportCreate: this.$hasPerm('accounts.add_account'),
          canImportUpdate: this.$hasPerm('accounts.change_account')
        },
        extraActions: [
          {
            name: 'add',
            title: this.$t('common.Add'),
            type: 'primary',
            can: () => {
              return vm.$hasPerm('accounts.add_account') && !this.$store.getters.currentOrgIsRoot
            },
            callback: async() => {
              await this.getAssetDetail()
              setTimeout(() => {
                vm.iAsset = this.asset
                vm.account = {}
                vm.accountCreateUpdateTitle = this.$t('assets.AddAccount')
                vm.showAddDialog = true
              })
            }
          },
          ...this.headerExtraActions
          // {
          //   name: 'autocreate',
          //   title: this.$t('accounts.AutoCreate'),
          //   type: 'default'
          // }
        ],
        canBulkDelete: vm.$hasPerm('accounts.delete_account'),
        searchConfig: {
          getUrlQuery: false,
          exclude: ['asset']
        },
        hasSearch: true
      }
    }
  },
  watch: {
    url(iNew) {
      this.$set(this.tableConfig, 'url', iNew)
      this.$set(this.headerActions.exportOptions, 'url', iNew.replace(/(.*)accounts/, '$1account-secrets'))
    }
  },
  mounted() {
    if (this.columns.length > 0) {
      this.tableConfig.columns = this.columns
    }
    if (this.otherActions) {
      const actionColumn = this.tableConfig.columns[this.tableConfig.columns.length - 1]
      for (const item of this.otherActions) {
        actionColumn.formatterArgs.extraActions.push(item)
      }
    }
  },
  methods: {
    onUpdateAuthDone(account) {
      Object.assign(this.account, account)
    },
    addAccountSuccess() {
      this.$refs.ListTable.reloadTable()
    },
    async getAssetDetail() {
      const { query: { asset }} = this.$route
      if (asset) {
        this.iAsset = await this.$axios.get(`/api/v1/assets/assets/${asset}/`)
      }
    },
    refresh() {
      this.$refs.ListTable.reloadTable()
    }
  }
}
</script>

<style lang='scss' scoped>
.cell a {
  color: var(--color-info);
}
</style>
