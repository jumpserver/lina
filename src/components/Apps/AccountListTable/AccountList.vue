<template>
  <div>
    <ListTable
      ref="ListTable"
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
      :asset="iAsset"
      :title="accountCreateUpdateTitle"
      :visible.sync="showAddDialog"
      @add="addAccountSuccess"
      @bulk-create-done="showBulkCreateResult($event)"
    />
    <AccountCreateUpdate
      v-if="showAddTemplateDialog"
      :account="account"
      :add-template="true"
      :asset="iAsset"
      :title="accountCreateByTemplateTitle"
      :visible.sync="showAddTemplateDialog"
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
  </div>
</template>

<script>
import ListTable from '@/components/Table/ListTable/index.vue'
import {
  ActionsFormatter, PlatformFormatter, SecretViewerFormatter
} from '@/components/Table/TableFormatters'
import ViewSecret from './ViewSecret.vue'
import UpdateSecretInfo from './UpdateSecretInfo.vue'
import AccountCreateUpdate from './AccountCreateUpdate.vue'
import { connectivityMeta } from './const'
import { openTaskPage } from '@/utils/jms'
import ResultDialog from './BulkCreateResultDialog.vue'
import AccountBulkUpdateDialog from '@/components/Apps/AccountListTable/AccountBulkUpdateDialog.vue'

export default {
  name: 'AccountListTable',
  components: {
    AccountBulkUpdateDialog,
    ResultDialog,
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
        'name', 'username', 'secret', 'asset', 'platform', 'date_updated', 'connect'
      ])
    },
    headerExtraActions: {
      type: Array,
      default: () => []
    },
    extraQuery: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      showViewSecretDialog: false,
      showUpdateSecretDialog: false,
      showResultDialog: false,
      showAddDialog: false,
      showAddTemplateDialog: false,
      createAccountResults: [],
      accountCreateUpdateTitle: this.$t('AddAccount'),
      accountCreateByTemplateTitle: this.$t('AddAccountByTemplate'),
      iAsset: this.asset,
      account: {},
      secretUrl: '',
      quickFilters: [
        {
          label: '过滤',
          options: [
            {
              label: '全部账号',
              value: ''
            },
            {
              label: '拥有的',
              value: 'windows'
            },
            {
              label: '收藏夹',
              value: 'linux'
            },
            {
              label: '最近访问',
              value: ''
            }
          ]
        },
        {
          label: '风险账号',
          options: [
            {
              label: '过期的密码',
              value: 'true'
            },
            {
              label: '冲突的密码',
              value: 'true'
            },
            {
              label: '违法策略',
              value: 'true'
            },
            {
              label: '禁用的资源',
              value: 'true'
            },
            {
              label: '回收站',
              value: 'true'
            }
          ]
        },
        {
          label: '账号类型',
          options: [
            {
              label: '全部',
              value: 'windows'
            },
            {
              label: ' 主机',
              value: 'linux'
            },
            {
              label: '数据库',
              value: 'database'
            },
            {
              label: '云',
              value: 'cloud'
            },
            {
              label: '网络设备',
              value: 'network'
            },
            {
              label: '应用',
              value: 'application'
            },
            {
              label: '其他',
              value: 'other'
            }
          ]
        }
      ],
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
            width: '120px',
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
          secret: {
            formatter: SecretViewerFormatter,
            formatterArgs: {
              secretFrom: 'api',
              hasDownload: false,
              actionLeft: true
            }
          },
          connect: {
            label: this.$t('Connect'),
            width: '80px',
            formatter: () => {
              return (
                <span class='connect'>
                  <el-button type='primary' size='mini' plain>
                    <i class='fa fa-desktop'/>
                  </el-button>
                </span>
              )
            }
          },
          asset: {
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
          platform: {
            label: this.$t('Platform'),
            formatter: PlatformFormatter,
            formatterArgs: {
              platformAttr: 'asset.platform'
            }
          },
          username: {
            width: '120px'
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
            formatterArgs: {
              hasUpdate: false, // can set function(row, value)
              hasDelete: false, // can set function(row, value)
              hasClone: false,
              canClone: true,
              moreActionsTitle: this.$t('More'),
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('View'),
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
                  name: 'Update',
                  title: this.$t('Edit'),
                  can: this.$hasPerm('accounts.change_account') && !this.$store.getters.currentOrgIsRoot,
                  callback: ({ row }) => {
                    const data = {
                      ...this.asset,
                      ...row.asset
                    }
                    vm.account = row
                    vm.iAsset = data
                    vm.showAddDialog = false
                    vm.accountCreateUpdateTitle = this.$t('UpdateAccount')
                    setTimeout(() => {
                      vm.showAddDialog = true
                    })
                  }
                },
                {
                  name: 'Test',
                  title: this.$t('验证密文'),
                  can: ({ row }) =>
                    !this.$store.getters.currentOrgIsRoot &&
                    this.$hasPerm('accounts.verify_account') &&
                    row.asset['auto_config'].ansible_enabled &&
                    row.asset['auto_config'].ping_enabled,
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
                  name: 'ClearSecret',
                  title: this.$t('ClearSecret'),
                  can: this.$hasPerm('accounts.change_account'),
                  type: 'primary',
                  callback: ({ row }) => {
                    this.$axios.patch(
                      `/api/v1/accounts/accounts/clear-secret/`,
                      { account_ids: [row.id] }
                    ).then(() => {
                      this.$message.success(this.$tc('ClearSuccessMsg'))
                    })
                  }
                },
                {
                  name: 'SecretHistory',
                  title: '密文历史'
                },
                {
                  name: 'CopyToOther',
                  title: '复制到其他资产',
                  type: 'primary',
                  divided: true
                },
                {
                  name: 'MoveToOther',
                  title: '移动到其他资产',
                  type: 'primary'
                },
                {
                  name: 'Clone',
                  title: this.$t('Duplicate'),
                  divided: true
                }
              ]
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
              return vm.$hasPerm('accounts.add_account') && !this.$store.getters.currentOrgIsRoot
            },
            callback: async() => {
              await this.getAssetDetail()
              setTimeout(() => {
                vm.iAsset = this.asset
                vm.account = {}
                vm.showAddDialog = true
              })
            }
          },
          {
            name: 'add-template',
            title: this.$t('TemplateAdd'),
            has: !(this.platform || this.asset),
            can: () => {
              return vm.$hasPerm('accounts.add_account') && !this.$store.getters.currentOrgIsRoot
            },
            callback: async() => {
              await this.getAssetDetail()
              setTimeout(() => {
                vm.iAsset = this.asset
                vm.account = {}
                vm.showAddTemplateDialog = true
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
            icon: 'fa-link',
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
    if (this.hasDeleteAction) {
      this.tableConfig.columnsMeta.actions.formatterArgs.extraActions.push(
        {
          name: 'Delete',
          title: this.$t('Delete'),
          can: this.$hasPerm('accounts.delete_account'),
          type: 'primary',
          callback: ({ row }) => {
            const msg = this.$t('AccountDeleteConfirmMsg')
            this.$confirm(msg, this.$tc('Info'), {
              type: 'warning',
              confirmButtonClass: 'el-button--danger',
              beforeClose: async(action, instance, done) => {
                if (action !== 'confirm') return done()
                this.$axios.delete(`/api/v1/accounts/accounts/${row.id}/`).then(() => {
                  done()
                  this.$refs.ListTable.reloadTable()
                  this.$message.success(this.$tc('DeleteSuccessMsg'))
                })
              }
            })
          }
        }
      )
    }
  },
  activated() {
    // 由于组件嵌套较深，有可能导致 Error in activated hook: "TypeError: Cannot read properties of undefined (reading 'getList')" 的问题
    setTimeout(() => {
      this.refresh()
    }, 300)
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

<style lang='scss' scoped>
.cell a {
  color: var(--color-info);
}

</style>
