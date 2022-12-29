<template>
  <div>
    <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
    <ViewSecret v-if="showViewSecretDialog" :visible.sync="showViewSecretDialog" :account="account" :url="secretUrl" />
    <UpdateSecretInfo
      v-if="showUpdateSecretDialog"
      :visible.sync="showUpdateSecretDialog"
      :account="account"
      @updateAuthDone="onUpdateAuthDone"
    />
    <AccountCreateUpdate
      v-if="showAddDialog"
      :visible.sync="showAddDialog"
      :asset="iAsset"
      :account="account"
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
        return this.url.replace('/assets/accounts/', '/assets/account-secrets/')
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
    hasColumnActions: {
      type: Boolean,
      default: true
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
    }
  },
  data() {
    const vm = this
    return {
      showViewSecretDialog: false,
      showUpdateSecretDialog: false,
      showAddDialog: false,
      iAsset: this.asset,
      account: {},
      secretUrl: '',
      tableConfig: {
        url: this.url,
        hasColumnActions: this.hasColumnActions,
        permissions: {
          app: 'assets',
          resource: 'account'
        },
        excludes: ['specific'],
        columnsShow: {
          min: ['name', 'username', 'actions'],
          default: [
            'name', 'username', 'version', 'privileged',
            'secret_type', 'source', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: function(row) {
              const to = {
                name: 'AssetAccountDetail',
                params: { id: row.id }
              }
              if (vm.$hasPerm('assets.view_account')) {
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
          version: {
            width: '70px'
          },
          secret_type: {
            width: '100px'
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
                  can: this.$hasPerm('assets.view_accountsecret'),
                  type: 'primary',
                  callback: ({ row }) => {
                    vm.secretUrl = `/api/v1/assets/account-secrets/${row.id}/`
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
                  can: this.$hasPerm('assets.delete_account'),
                  type: 'primary',
                  callback: ({ row }) => {
                    this.$axios.delete(`/api/v1/assets/accounts/${row.id}/`).then(() => {
                      this.$message.success(this.$tc('common.deleteSuccessMsg'))
                      this.$refs.ListTable.reloadTable()
                    })
                  }
                },
                {
                  name: 'Test',
                  title: this.$t('common.Test'),
                  can: this.$hasPerm('assets.test_account'),
                  callback: ({ row }) => {
                    this.$axios.post(
                      `/api/v1/assets/accounts/${row.id}/verify/`,
                      { action: 'test' }
                    ).then(res => {
                      openTaskPage(res['task'])
                    })
                  }
                },
                {
                  name: 'Update',
                  title: this.$t('common.Update'),
                  can: this.$hasPerm('assets.change_account') && !this.$store.getters.currentOrgIsRoot,
                  callback: ({ row }) => {
                    vm.account = row
                    vm.iAsset = row.asset
                    vm.showAddDialog = false
                    setTimeout(() => {
                      vm.showAddDialog = true
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: this.hasLeftActions,
        hasMoreActions: true,
        hasCreate: false,
        hasImport: true,
        hasExport: this.hasExport && this.$hasPerm('assets.view_accountsecret'),
        exportOptions: {
          url: this.exportUrl,
          mfaVerifyRequired: true
        },
        extraActions: [
          {
            name: 'add',
            title: this.$t('common.Add'),
            type: 'primary',
            can: () => {
              return vm.$hasPerm('assets.add_account')
            },
            callback: async() => {
              await this.getAssetDetail()
              setTimeout(() => {
                vm.showAddDialog = true
              })
            }
          }
        ],
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
      this.$set(this.headerActions.exportOptions, 'url', iNew.replace('/accounts/', '/account-secrets/'))
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
