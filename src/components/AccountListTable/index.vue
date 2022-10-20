<template>
  <div>
    <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
    <ShowSecretInfo v-if="showViewSecretDialog" :visible.sync="showViewSecretDialog" :account="account" />
    <UpdateSecretInfo
      v-if="showUpdateSecretDialog"
      :visible.sync="showUpdateSecretDialog"
      :account="account"
      @updateAuthDone="onUpdateAuthDone"
    />
    <AddAccount
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
import ShowSecretInfo from './ShowSecretInfo'
import UpdateSecretInfo from './UpdateSecretInfo'
import AddAccount from './AddAccount'
import { connectivityMeta } from './const'
import { openTaskPage } from '@/utils/jms'
import { hasUUID } from '@/utils/common'

export default {
  name: 'AccountListTable',
  components: {
    ListTable,
    UpdateSecretInfo,
    ShowSecretInfo,
    AddAccount
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
    columns: {
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
      iAsset: this.asset,
      account: {},
      tableConfig: {
        url: this.url,
        permissions: {
          app: 'assets',
          resource: 'account'
        },
        columns: [
          'asset', 'username', 'version', 'privileged',
          'secret_type', 'date_created', 'date_updated', 'actions'
        ],
        columnsShow: {
          min: ['username', 'actions'],
          default: ['hostname', 'ip', 'username', 'version', 'privileged', 'actions']
        },
        columnsMeta: {
          asset: {
            label: this.$t('assets.Asset'),
            showOverflowTooltip: true,
            formatter: function(row) {
              const to = {
                name: 'AssetDetail',
                params: { id: row.asset.id }
              }
              if (vm.$hasPerm('assets.view_asset')) {
                return <router-link to={ to } >{ row.asset.name }</router-link>
              } else {
                return <span>{ row.asset.name }</span>
              }
            }
          },
          username: {
            showOverflowTooltip: true
          },
          version: {
            width: '70px'
          },
          privileged: {
            label: this.$t('assets.Privileged'),
            formatterArgs: {
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
                  can: this.$hasPerm('assets.view_assetaccountsecret'),
                  type: 'primary',
                  callback: ({ row }) => {
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
                  can: this.$hasPerm('assets.change_assetaccountsecret') && !this.$store.getters.currentOrgIsRoot,
                  callback: ({ row }) => {
                    vm.account = row
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
        hasExport: this.$hasPerm('assets.view_assetaccountsecret'),
        exportOptions: {
          url: this.exportUrl,
          mfaVerifyRequired: true
        },
        extraActions: [
          {
            name: 'add',
            title: this.$t('common.Add'),
            type: 'primary',
            can: vm.$hasPerm('assets.add_account'),
            callback: () => {
              this.account = null
              this.showAddDialog = true
            }
          }
        ],
        searchConfig: {
          exclude: ['systemuser', 'asset']
        },
        hasSearch: true
      }
    }
  },
  watch: {
    url(iNew) {
      this.$set(this.tableConfig, 'url', iNew)
      this.$set(this.headerActions.exportOptions, 'url', iNew.replace('/accounts/', '/account-secrets/'))
    },
    '$route.query.assets': {
      immediate: true,
      handler() {
        this.hasAccountPermission()
      }
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
    hasAccountPermission() {
      const { path, query } = this.$route
      if (!hasUUID(path)) {
        const hasPerm = this.$hasPerm('assets.add_account') && !!query.assets
        this.iAsset = { id: query.assets }
        this.$set(this.headerActions.extraActions[0], 'can', hasPerm)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.cell a {
  color: var(--color-info);
}
</style>
