<template>
  <div>
    <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
    <ShowSecretInfo v-if="showViewSecretDialog" :visible.sync="showViewSecretDialog" :account="account" />
    <UpdateSecretInfo v-if="showUpdateSecretDialog" :visible.sync="showUpdateSecretDialog" :account="account" @updateAuthDone="onUpdateAuthDone" />
  </div>
</template>

<script>
import ListTable from '@/components/ListTable/index'
import { ActionsFormatter, DetailFormatter, DisplayFormatter } from '@/components/TableFormatters'
import ShowSecretInfo from './ShowSecretInfo'
import UpdateSecretInfo from './UpdateSecretInfo'
import { connectivityMeta } from './const'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AccountListTable',
  components: {
    ListTable,
    UpdateSecretInfo,
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
    }
  },
  data() {
    const vm = this
    return {
      showViewSecretDialog: false,
      showUpdateSecretDialog: false,
      account: {},
      tableConfig: {
        url: this.url,
        permissions: {
          app: 'assets',
          resource: 'authbook'
        },
        columns: [
          'hostname', 'ip', 'username', 'version', 'connectivity',
          'systemuser', 'date_created', 'date_updated', 'actions'
        ],
        columnsShow: {
          min: ['username', 'actions'],
          default: ['hostname', 'ip', 'username', 'version', 'actions']
        },
        columnsMeta: {
          hostname: {
            prop: 'hostname',
            label: this.$t('assets.Hostname'),
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
          systemuser: {
            formatter: DisplayFormatter
          },
          version: {
            width: '70px'
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
                    vm.showViewSecretDialog = true
                  }
                },
                {
                  name: 'Delete',
                  title: this.$t('common.Delete'),
                  can: this.$hasPerm('assets.delete_authbook'),
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
                  can: this.$hasPerm('assets.test_authbook'),
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
                    vm.showUpdateSecretDialog = false
                    setTimeout(() => {
                      vm.showUpdateSecretDialog = true
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
        hasImport: false,
        hasExport: this.$hasPerm('assets.view_assetaccountsecret'),
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
  watch: {
    url(iNew) {
      this.$set(this.tableConfig, 'url', iNew)
      this.$set(this.headerActions.exportOptions, 'url', iNew.replace('/accounts/', '/account-secrets/'))
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
    onUpdateAuthDone(account) {
      Object.assign(this.account, account)
    }
  }
}
</script>

<style lang='less' scoped>

</style>
