<template>
  <div>
    <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="title" />
    <ShowSecretInfo v-if="showViewSecretDialog" :visible.sync="showViewSecretDialog" :account="account" />
  </div>
</template>

<script>
import { ActionsFormatter, DetailFormatter } from '@/components/TableFormatters'
import { GenericListPage } from '@/layout/components'

import ShowSecretInfo from './ShowSecretInfo'

export default {
  name: 'Detail',
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
    },
    systemUserDisabled: {
      type: Boolean,
      default: true
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
          'app_display', 'username', 'category_display',
          'type_display', 'systemuser', 'version', 'actions'
        ],
        columnsMeta: {
          app_display: {
            showOverflowTooltip: true,
            formatter: DetailFormatter,
            formatterArgs: {
              getRoute({ row }) {
                switch (row['category']) {
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
              can: this.systemUserDisabled && this.$hasPerm('assets.view_systemuser'),
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
                  type: 'primary',
                  can: this.$hasPerm('applications.view_applicationaccountsecret'),
                  callback: function({ row }) {
                    this.account = row
                    this.showViewSecretDialog = true
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
        hasImport: false,
        hasExport: this.$hasPerm('applications.view_applicationaccountsecret'),
        exportOptions: {
          url: this.exportUrl,
          mfaVerifyRequired: true
        },
        searchConfig: {
          exclude: ['systemuser', 'app']
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
