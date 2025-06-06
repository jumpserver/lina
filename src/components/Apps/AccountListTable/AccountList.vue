<template>
  <div>
    <DrawerListTable
      ref="ListTable"
      :detail-drawer="detailDrawer"
      :header-actions="headerActions"
      :quick-filters="quickFilters"
      :table-config="tableConfig"
    />
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
      :add-template="addTemplate"
      :asset="iAsset"
      :title="accountCreateUpdateTitle"
      :visible.sync="showAddDialog"
      @add="addAccountSuccess"
      @bulk-create-done="showBulkCreateResult($event)"
    />
    <ResultDialog
      v-if="showResultDialog"
      :result="createAccountResults"
      :visible.sync="showResultDialog"
      @close-all="closeAll"
    />
    <AccountBulkUpdateDialog
      v-if="updateSelectedDialogSetting.visible"
      :visible.sync="updateSelectedDialogSetting.visible"
      v-bind="updateSelectedDialogSetting"
      @update="handleAccountBulkUpdate"
    />
    <PasswordHistoryDialog
      v-if="showPasswordHistoryDialog"
      :account="currentAccountColumn"
      :visible.sync="showPasswordHistoryDialog"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { accountOtherActions, accountQuickFilters, connectivityMeta, isDirectoryServiceAccount } from './const'
import { openTaskPage } from '@/utils/jms'
import {
  AccountConnectFormatter,
  ActionsFormatter,
  PlatformFormatter,
  SecretViewerFormatter
} from '@/components/Table/TableFormatters'
import ViewSecret from './ViewSecret.vue'
import UpdateSecretInfo from './UpdateSecretInfo.vue'
import ResultDialog from './BulkCreateResultDialog.vue'
import AccountCreateUpdate from './AccountCreateUpdate.vue'
import PasswordHistoryDialog from './PasswordHistoryDialog.vue'
import DrawerListTable from '@/components/Table/DrawerListTable/index.vue'
import AccountBulkUpdateDialog from '@/components/Apps/AccountListTable/AccountBulkUpdateDialog.vue'

export default {
  name: 'AccountListTable',
  components: {
    ViewSecret,
    ResultDialog,
    DrawerListTable,
    UpdateSecretInfo,
    AccountCreateUpdate,
    PasswordHistoryDialog,
    AccountBulkUpdateDialog
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
      default: true
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
    hasDeleteAction: {
      type: Boolean,
      default: true
    },
    columnsMeta: {
      type: Object,
      default: () => {
      }
    },
    columnsDefault: {
      type: Array,
      default: () => ([
        'name', 'username', 'secret', 'asset', 'platform', 'connect'
      ])
    },
    headerExtraActions: {
      type: Array,
      default: () => []
    },
    extraQuery: {
      type: Object,
      default: () => ({})
    },
    showQuickFilters: {
      type: Boolean,
      default: true
    },
    showActions: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const vm = this
    return {
      addTemplate: false,
      isUpdateAccount: false,
      currentAccountColumn: {},
      showPasswordHistoryDialog: false,
      showViewSecretDialog: false,
      showUpdateSecretDialog: false,
      showResultDialog: false,
      showAddDialog: false,
      showAddTemplateDialog: false,
      detailDrawer: () => import('@/views/accounts/Account/AccountDetail/index.vue'),
      createAccountResults: [],
      iAsset: this.asset,
      account: {},
      secretUrl: '',
      quickFilters: this.showQuickFilters ? accountQuickFilters(this) : [],
      tableConfig: {
        url: this.url,
        permissions: {
          app: 'assets',
          resource: 'account'
        },
        extraQuery: this.extraQuery,
        columnsExclude: ['spec_info'],
        columnsAdd: ['secret', 'platform', 'connect'],
        columnsShow: {
          min: ['name', 'username', 'actions'],
          default: this.columnsDefault
        },
        columnsMeta: {
          name: {
            minWidth: '60px',
            formatterArgs: {
              can: () => vm.$hasPerm('accounts.view_account'),
              getRoute: ({ row }) => ({
                name: 'AccountDetail',
                params: { id: row.id }
              }),
              getTitle: ({ row }) => {
                let title = row.name
                if (row.ds && this.asset && this.asset.id !== row.asset.id) {
                  const dsID = row.ds.id.split('-')[0]
                  title = `${row.name}@${dsID}`
                }
                return title
              },
              getDrawerTitle({ row }) {
                return `${row.username}@${row.asset.name}`
              }
            }
          },
          secret: {
            formatter: SecretViewerFormatter,
            width: '130px',
            formatterArgs: {
              secretFrom: 'api',
              hasDownload: false,
              actionLeft: true
            }
          },
          connect: {
            label: this.$t('Connect'),
            width: '80px',
            formatter: AccountConnectFormatter,
            formatterArgs: {
              asset: this.asset,
              can: ({ row }) => {
                return this.currentUserIsSuperAdmin
              }
            }
          },
          ds: {
            width: '100px',
            formatter: (row) => {
              if (row.ds && row.ds['domain_name']) {
                return row.ds['domain_name']
              } else {
                return ''
              }
            }
          },
          platform: {
            label: this.$t('Platform'),
            width: '150px',
            formatter: PlatformFormatter,
            formatterArgs: {
              platformAttr: 'asset.platform'
            }
          },
          asset: {
            minWidth: '100px',
            formatter: function(row) {
              return row.asset.name
            }
          },
          username: {
            minWidth: '60px',
            formatter: function(row) {
              if (row.ds && row.ds['domain_name']) {
                return `${row.username}@${row.ds['domain_name']}`
              } else {
                return row.username
              }
            }
          },
          secret_type: {
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
            width: '120px',
            formatterArgs: {
              showFalse: false
            }
          },
          privileged: {
            width: '120px',
            formatterArgs: {
              showText: false,
              showFalse: true
            }
          },
          connectivity: connectivityMeta,
          actions: {
            formatter: ActionsFormatter,
            has: this.showActions,
            formatterArgs: {
              performDelete: ({ row }) => {
                const id = row.id
                const url = `/api/v1/accounts/accounts/${id}/`
                return this.$axios.delete(url)
              },
              hasUpdate: false, // can set function(row, value)
              hasDelete: true, // can set function(row, value)
              hasClone: false,
              canDelete: ({ row }) => vm.$hasPerm('accounts.delete_account') && !isDirectoryServiceAccount(row, this),
              moreActionsTitle: this.$t('More'),
              extraActions: accountOtherActions(this)
            }
          },
          ...this.columnsMeta
        }
      },
      headerActions: {
        hasLabelSearch: true,
        hasLeftActions: this.hasLeftActions,
        hasMoreActions: true,
        hasCreate: false,
        hasImport: this.hasImport,
        hasExport: this.hasExport && this.$hasPerm('accounts.view_accountsecret'),
        exportOptions: {
          url: this.exportUrl,
          mfaVerifyRequired: true,
          tips: this.$t('AccountExportTips')
        },
        importOptions: {
          canImportCreate: this.$hasPerm('accounts.add_account'),
          canImportUpdate: this.$hasPerm('accounts.change_account')
        },
        extraActions: [
          {
            name: 'add',
            title: this.$t('Create'),
            type: 'primary',
            icon: 'plus',
            can: () => {
              return vm.$hasPerm('accounts.add_account') && !vm.$store.getters.currentOrgIsRoot
            },
            callback: () => {
              setTimeout(() => {
                vm.iAsset = this.asset
                vm.account = {}
                this.addTemplate = false
                this.showAddDialog = true
              }, 200)
            }
          },
          {
            name: 'add-template',
            title: this.$t('TemplateAdd'),
            has: !(this.platform || this.asset),
            can: () => {
              return vm.$hasPerm('accounts.add_account') && !vm.$store.getters.currentOrgIsRoot
            },
            callback: async() => {
              await this.getAssetDetail()
              setTimeout(() => {
                vm.iAsset = this.asset
                vm.account = {}
                vm.showAddDialog = true
                vm.addTemplate = true
              })
            }
          },
          ...this.headerExtraActions
        ],
        extraMoreActions: [
          {
            name: 'TestSelected',
            title: this.$t('TestSelected'),
            type: 'primary',
            icon: 'verify',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 &&
                ['clickhouse', 'redis', 'website', 'chatgpt'].indexOf(selectedRows[0].asset.type.value) === -1 &&
                !this.$store.getters.currentOrgIsRoot
            },
            callback: function({ selectedRows }) {
              const ids = selectedRows.map(v => {
                return v.id
              })
              this.$axios.post(
                '/api/v1/accounts/accounts/tasks/',
                { action: 'verify', accounts: ids }).then(res => {
                openTaskPage(res['task'])
              }).catch(err => {
                this.$message.error(this.$tc('BulkVerifyErrorMsg' + ' ' + err))
              })
            }.bind(this)
          },
          {
            name: 'BatchClearSecret',
            title: this.$t('ClearSecret'),
            type: 'primary',
            icon: 'clean',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 && vm.$hasPerm('accounts.change_account')
            },
            callback: function({ selectedRows }) {
              const ids = selectedRows.map(v => {
                return v.id
              })
              this.$axios.patch(
                '/api/v1/accounts/accounts/clear-secret/',
                { account_ids: ids }).then(() => {
                this.$message.success(this.$tc('ClearSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$tc('ClearErrorMsg' + ' ' + err))
              })
            }.bind(this)
          },
          {
            name: 'UpdateSelected',
            title: this.$t('UpdateSelected'),
            icon: 'batch-update',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 &&
                !this.$store.getters.currentOrgIsRoot &&
                vm.$hasPerm('accounts.change_account') &&
                selectedRows.every(i => i.secret_type.value === selectedRows[0].secret_type.value)
            },
            callback: ({ selectedRows }) => {
              vm.updateSelectedDialogSetting.selectedRows = selectedRows
              vm.updateSelectedDialogSetting.visible = true
            }
          }
        ],
        canBulkDelete: vm.$hasPerm('accounts.delete_account'),
        searchConfig: {
          getUrlQuery: false,
          exclude: ['asset']
        },
        hasSearch: true
      },
      updateSelectedDialogSetting: {
        visible: false,
        selectedRows: []
      }
    }
  },
  computed: {
    ...mapGetters(['currentUserIsSuperAdmin']),
    accountCreateUpdateTitle() {
      if (this.addTemplate) {
        return this.$t('AddAccountByTemplate')
      } else if (this.isUpdateAccount) {
        return this.$t('UpdateAccount')
      } else {
        return this.$t('AddAccount')
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
    this.setActions()
  },
  activated() {
    // 由于组件嵌套较深，有可能导致 Error in activated hook: "TypeError: Cannot read properties of undefined (reading 'getList')" 的问题
    if (this.tabDeactivated) {
      setTimeout(() => this.refresh(), 300)
    }
  },
  deactivated() {
    this.tabDeactivated = true
  },
  methods: {
    setActions() {
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
    onUpdateAuthDone(account) {
      Object.assign(this.account, account)
    },
    addAccountSuccess() {
      // Reflect.deleteProperty(this.$route.query, 'flag')
      this.isUpdateAccount = false
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
    },
    showBulkCreateResult(results) {
      setTimeout(() => {
        this.showResultDialog = true
        this.createAccountResults = results
      }, 350)
    },
    handleAccountBulkUpdate() {
      this.updateSelectedDialogSetting.visible = false
      this.$refs.ListTable.reloadTable()
    },
    closeAll() {
      setTimeout(() => {
        this.showResultDialog = false
      }, 350)

      setTimeout(() => {
        this.showAddDialog = false
      }, 800)

      setTimeout(() => {
        this.refresh()
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
.cell a {
  color: var(--color-info);
}
</style>
