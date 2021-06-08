<template>
  <Page>
    <el-row>
      <el-col :span="11">
        <GenericListTable
          ref="LeftTable"
          class="application-table"
          :header-actions="leftTable.headerActions"
          :table-config="leftTable.tableConfig"
          @row-click="leftTable.tableConfig.rowClick"
        />
      </el-col>
      <el-col :span="13">
        <GenericListTable
          ref="RightTable"
          class="application-user-table"
          :header-actions="rightTable.headerActions"
          :table-config="rightTable.tableConfig"
        />
      </el-col>
    </el-row>
    <Dialog v-if="showMFADialog" width="50" :title="this.$t('common.MFAConfirm')" :visible.sync="showMFADialog" :show-confirm="false" :show-cancel="false" :destroy-on-close="true">
      <div v-if="MFAConfirmed">
        <el-form label-position="right" label-width="80px" :model="MFAInfo">
          <el-form-item :label="this.$t('assets.Applications')">
            <el-input v-model="MFAInfo.application" disabled />
          </el-form-item>
          <el-form-item :label="this.$t('assets.Username')">
            <el-input v-model="MFAInfo.username" disabled />
          </el-form-item>
          <el-form-item :label="this.$t('assets.Password')">
            <el-input v-model="MFAInfo.password" type="password" show-password />
          </el-form-item>
        </el-form>
      </div>
      <el-row v-else :gutter="20">
        <el-col :span="4">
          <div style="line-height: 34px;text-align: center">MFA</div>
        </el-col>
        <el-col :span="14">
          <el-input v-model="MFAInput" />
          <span class="help-tips help-block">{{ $t('common.MFARequireForSecurity') }}</span>
        </el-col>
        <el-col :span="4">
          <el-button size="mini" type="primary" style="line-height:20px " @click="MFAConfirm">{{ this.$t('common.Confirm') }}</el-button>
        </el-col>
      </el-row>
    </Dialog>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import GenericListTable from '@/layout/components/GenericListTable'
import { ActionsFormatter, DetailFormatter } from '@/components/TableFormatters'
import Dialog from '@/components/Dialog'
import { mapGetters } from 'vuex'

export default {
  name: 'AssetAccountList',
  components: {
    GenericListTable, Page, Dialog
  },
  data() {
    const vm = this
    return {
      showMFADialog: false,
      MFAConfirmed: false,
      MFAInput: '',
      MFAInfo: {
        systemUser: '',
        application: '',
        username: '',
        password: ''
      },
      clickedRow: {},
      leftTable: {
        tableConfig: {
          url: '/api/v1/applications/applications/',
          columns: [
            'name', 'category_display', 'type_display', 'comment'
          ],
          columnsShow: {
            min: ['name'],
            default: ['name', 'category_display', 'type_display']
          },
          columnsMeta: {
            name: {
              formatter: DetailFormatter,
              formatterArgs: {
                getRoute({ row, col, cellValue }) {
                  return {
                    'db': 'DatabaseAppDetail', 'remote_app': 'RemoteAppDetail', 'cloud': 'KubernetesAppDetail'
                  }[row.category]
                }
              },
              showOverflowTooltip: true,
              sortable: false
            }
          },
          tableAttrs: {
            stripe: false, // 斑马纹表格
            border: true, // 表格边框
            fit: true, // 宽度自适应,
            tooltipEffect: 'dark',
            rowClassName({ row, rowIndex }) {
              if (row === vm.clickedRow) {
                return 'row-clicked'
              }
              return ''
            }
          },
          rowClick: function(row, column, event) {
            vm.rightTable.tableConfig.url = `/api/v1/applications/application-users/?application_id=${row.id}`
            vm.clickedRow = row
            vm.MFAInfo.application = row.name
          }
        },
        headerActions: {
          hasLeftActions: false,
          hasCreate: false,
          hasExport: false,
          hasImport: false,
          hasBulkDelete: false,
          hasBulkUpdate: false
        }
      },
      rightTable: {
        tableConfig: {
          url: `/api/v1/applications/application-users/?application_id=`,
          columns: [
            'name', 'username', 'username_same_with_user', 'protocol', 'login_mode', 'priority', 'comment', 'actions'
          ],
          columnsShow: {
            min: ['name', 'username', 'actions'],
            default: ['name', 'username', 'date_created', 'actions']
          },
          columnsMeta: {
            name: {
              formatter: DetailFormatter,
              formatterArgs: {
                route: 'SystemUserDetail'
              },
              showOverflowTooltip: true,
              sortable: false
            },
            protocol: {
              sortable: false
            },
            login_mode: {
              sortable: false
            },
            actions: {
              label: this.$t('common.Action'),
              align: 'center',
              width: 150,
              formatter: ActionsFormatter,
              formatterArgs: {
                hasUpdate: false, // can set function(row, value)
                hasDelete: false, // can set function(row, value)
                hasClone: false,
                moreActionsTitle: this.$t('common.More'),
                extraActions: [
                  {
                    name: 'View',
                    title: this.$t('common.View'),
                    type: 'primary',
                    callback: function(val) {
                      this.MFAInfo.systemUser = val.row
                      if (!this.needMFAVerify) {
                        this.showMFADialog = true
                        this.MFAConfirmed = true
                        this.$axios.get(`/api/v1/assets/system-users/${this.MFAInfo.systemUser.id}/auth-info/`).then(res => {
                          this.MFAConfirmed = true
                          this.MFAInfo.username = res.username
                          this.MFAInfo.password = res.password
                        })
                      } else {
                        this.showMFADialog = true
                      }
                    }.bind(this)
                  }
                ]
              }
            },
            tableAttrs: {
              stripe: false, // 斑马纹表格
              border: true, // 表格边框
              fit: true, // 宽度自适应,
              tooltipEffect: 'dark',
              rowClassName({ row, rowIndex }) {
                return 'row-background-color'
              }
            }
          }
        },
        headerActions: {
          hasLeftActions: false,
          hasImport: false
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
  methods: {
    MFAConfirm() {
      if (this.MFAInput.length !== 6) {
        return this.$message.error(this.$t('common.MFAErrorMsg'))
      }
      this.$axios.post(
        `/api/v1/authentication/otp/verify/`, {
          code: this.MFAInput
        }
      ).then(
        res => {
          this.$store.dispatch('users/setMFAVerify')
          this.$axios.get(`/api/v1/assets/system-users/${this.MFAInfo.systemUser.id}/auth-info/`).then(res => {
            this.MFAConfirmed = true
            this.MFAInfo.username = res.username
            this.MFAInfo.password = res.password
          })
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
  .application-table ::v-deep .row-clicked, .application-user-table ::v-deep .row-background-color {
    background-color: #f5f7fa;
  }
</style>
