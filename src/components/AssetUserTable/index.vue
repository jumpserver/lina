<template>
  <div>
    <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
    <ShowSecretInfo :show-dialog="showViewSecretDialog" :asset-user="assetUser" />
    <UpdateSecretInfo :show="showUpdateSecretDialog" :asset-user="assetUser" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ListTable from '@/components/ListTable/index'
import { ActionsFormatter, DateFormatter } from '@/components/ListTable/formatters'
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
      assetUser: {},
      tableConfig: {
        url: this.url,
        columns: [
          {
            prop: 'hostname',
            label: this.$t('assets.Hostname'),
            showOverflowTooltip: true
          },
          {
            prop: 'ip',
            label: this.$t('assets.ip'),
            width: '120px'
          },
          {
            prop: 'username',
            label: this.$t('assets.Username'),
            showOverflowTooltip: true
          },
          {
            prop: 'version',
            label: this.$t('assets.Version'),
            width: '70px'
          },
          {
            prop: 'date_created',
            label: this.$t('assets.date_joined'),
            formatter: DateFormatter
          },
          {
            prop: 'id',
            label: this.$t('common.Action'),
            align: 'center',
            width: 150,
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
                  callback: function(val) {
                    this.$log.debug('Click view')
                    this.showViewSecretDialog = true
                  }.bind(this)
                },
                {
                  name: 'Delete',
                  title: this.$t('common.Delete'),
                  type: 'primary',
                  callback: (val) => {
                    this.$axios.delete(`/api/v1/assets/asset-users/${val.row.id}/`).then(() => {
                      this.$message.success(this.$t('common.deleteSuccessMsg'))
                      this.$refs.ListTable.reloadTable()
                    })
                  }
                },
                {
                  name: 'Test',
                  title: this.$t('common.Test'),
                  callback: (val) => {
                    this.$axios.post(
                      `/api/v1/assets/asset-users/tasks/?id=${val.row.id}`,
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
                  callback: function(val) {
                    this.showDialog = true
                    this.dialogInfo.asset = val.row.asset
                    this.dialogInfo.hostname = val.row.hostname
                    this.dialogInfo.username = val.row.username
                  }.bind(this)
                }
              ]
            }
          }
        ],
        extraQuery: {
          latest: 1
        }
      },
      headerActions: {
        hasLeftActions: this.hasLeftActions,
        hasMoreActions: false,
        hasImport: this.hasImport,
        hasExport: this.hasExport,
        hasSearch: true,
        searchConfig: {
          options: [
            {
              label: this.$t('assets.OnlyLatestVersion'),
              value: 'latest',
              children: [
                {
                  label: this.$t('common.Yes'),
                  value: 1
                },
                {
                  label: this.$t('common.No'),
                  value: 0
                }
              ]
            }
          ]
        }
      }
    }
  },
  computed: {
    ...mapGetters([
      'MFA_TTl',
      'MFAVerifyAt',
      'publicSettings'
    ]),
    needMFAVerify() {
      if (!this.publicSettings.SECURITY_VIEW_AUTH_NEED_MFA) {
        return false
      }
      const ttl = this.publicSettings.SECURITY_MFA_VERIFY_TTL
      const now = new Date()
      return !(this.MFAVerifyAt && (now - this.MFAVerifyAt) < ttl * 1000)
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
  created() {
    if (this.handleExport) {
      this.headerActions.handleExport = this.handleExport
    }
    if (this.handleImport) {
      this.headerActions.handleImport = this.handleImport
    }
  },
  methods: {
  }
}
</script>

<style lang='less' scoped>

</style>
