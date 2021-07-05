<template>
  <div>
    <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
    <ShowSecretInfo v-if="showViewSecretDialog" :visible.sync="showViewSecretDialog" :account="account" />
    <UpdateSecretInfo :visible.sync="showUpdateSecretDialog" :account="account" @updateAuthDone="onUpdateAuthDone" />
  </div>
</template>

<script>
import ListTable from '@/components/ListTable/index'
import { ActionsFormatter } from '@/components/TableFormatters'
import ShowSecretInfo from './ShowSecretInfo'
import UpdateSecretInfo from './UpdateSecretInfo'

export default {
  name: 'Detail',
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
          'hostname', 'ip', 'username_display', 'version',
          'date_created', 'date_updated', 'actions'
        ],
        columnsShow: {
          min: ['username_display', 'ip', 'actions'],
          default: ['hostname', 'ip', 'username_display', 'version', 'actions']
        },
        columnsMeta: {
          hostname: {
            prop: 'hostname',
            label: this.$t('assets.Hostname'),
            showOverflowTooltip: true
          },
          ip: {
            width: '120px'
          },
          username_display: {
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
                  type: 'primary',
                  callback: function({ row }) {
                    this.account = row
                    this.showViewSecretDialog = true
                  }.bind(this)
                },
                {
                  name: 'Delete',
                  title: this.$t('common.Delete'),
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
                  callback: ({ row }) => {
                    this.$axios.post(
                      `/api/v1/assets/accounts/${row.id}/tasks/`,
                      { action: 'test' }
                    ).then(res => {
                      window.open(`/#/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
                    })
                  }
                },
                {
                  name: 'Update',
                  title: this.$t('common.Update'),
                  can: !this.$store.getters.currentOrgIsRoot,
                  callback: function({ row }) {
                    this.account = row
                    this.showUpdateSecretDialog = true
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
          url: '/api/v1/assets/account-secrets/',
          mfaVerifyRequired: true
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
