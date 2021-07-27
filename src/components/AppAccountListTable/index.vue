<template>
  <div>
    <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
    <ShowSecretInfo v-if="showViewSecretDialog" :visible.sync="showViewSecretDialog" :account="account" />
  </div>
</template>

<script>
import ListTable from '@/components/ListTable/index'
import { ActionsFormatter, DetailFormatter } from '@/components/TableFormatters'
import ShowSecretInfo from './ShowSecretInfo'

export default {
  name: 'Detail',
  components: {
    ListTable,
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
        return this.url.replace('/applications/accounts/', '/applications/account-secrets/')
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
    return {
      showViewSecretDialog: false,
      showUpdateSecretDialog: false,
      account: {},
      tableConfig: {
        url: this.url,
        columns: [
          'app_name', 'username', 'app_category_display',
          'app_type_display', 'systemuser', 'actions'
        ],
        columnsMeta: {
          app_name: {
            showOverflowTooltip: true,
            formatter: DetailFormatter,
            formatterArgs: {
              getRoute({ row }) {
                switch (row['app_category']) {
                  case 'remote_app':
                    return {
                      name: 'RemoteAppDetail',
                      params: { id: row.app }
                    }
                  case 'db':
                    return {
                      name: 'DatabaseAppDetail',
                      params: { id: row.app }
                    }
                  default:
                    return {
                      name: 'KubernetesAppDetail',
                      params: { id: row.app }
                    }
                }
              }
            }
          },
          username: {
            showOverflowTooltip: true
          },
          systemuser: {
            showOverflowTooltip: true,
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle({ row }) {
                return row.systemuser_display
              },
              getRoute({ row }) {
                return {
                  name: 'SystemUserDetail',
                  params: { id: row.systemuser }
                }
              }
            }
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
                  type: 'primary',
                  callback: function({ row }) {
                    this.account = row
                    this.showViewSecretDialog = true
                  }.bind(this)
                },
                {
                  name: 'Update',
                  title: this.$t('common.Update'),
                  can: !this.$store.getters.currentOrgIsRoot,
                  callback: function({ row }) {
                    this.$message.success(this.$tc('applications.updateAccountMsg'))
                  }.bind(this)
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: this.hasLeftActions,
        hasMoreActions: false,
        hasImport: this.hasImport,
        hasExport: this.hasExport,
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
