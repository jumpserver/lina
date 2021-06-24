<template>
  <Page>
    <el-row>
      <el-col :span="11">
        <GenericListTable ref="LeftTable" class="application-table" :header-actions="leftTable.headerActions" :table-config="leftTable.tableConfig" @row-click="leftTable.tableConfig.rowClick" />
      </el-col>
      <el-col :span="13">
        <GenericListTable v-if="!isInit" ref="RightTable" class="application-user-table" :header-actions="rightTable.headerActions" :table-config="rightTable.tableConfig" />
        <div v-else class="noDataR">
          <div class="hintWrap">
            <div>{{ $t('accounts.PleaseClickLeftApplicationToViewApplicationAccount') }}</div>
          </div>
        </div>
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
          <el-form-item :label="this.$t('assets.PasswordOrToken')">
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
    <Dialog :title="$t('common.Export')" :visible.sync="showExportDialog" :destroy-on-close="true" @confirm="handleExportConfirm()" @cancel="handleExportCancel()">
      <el-form label-position="left" style="padding-left: 50px">
        <el-form-item :label="$t('common.fileType' )" :label-width="'100px'">
          <el-radio-group v-model="exportTypeOption">
            <el-radio v-for="option of exportTypeOptions" :key="option.value" style="padding: 10px 20px;" :label="option.value" :disabled="!option.can">{{ option.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="this.$t('common.imExport.ExportRange')" :label-width="'100px'">
          <el-radio-group v-model="exportOption">
            <el-radio v-for="option of exportOptions" :key="option.value" class="export-item" :label="option.value" :disabled="!option.can">{{ option.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </Dialog>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import GenericListTable from '@/layout/components/GenericListTable'
import { ActionsFormatter, DetailFormatter } from '@/components/TableFormatters'
import Dialog from '@/components/Dialog'
import { mapGetters } from 'vuex'
import { createSourceIdCache } from '@/api/common'
import * as queryUtil from '@/components/DataTable/compenents/el-data-table/utils/query'

export default {
  name: 'AssetAccountList',
  components: {
    GenericListTable, Page, Dialog
  },
  data() {
    const vm = this
    return {
      isInit: true,
      showMFADialog: false,
      MFAConfirmed: false,
      MFAInput: '',
      MFAInfo: {
        systemUser: '',
        application: '',
        username: '',
        password: ''
      },
      selectedRows: '',
      showExportDialog: false,
      dialogStatus: '',
      exportOption: 'all',
      exportTypeOption: 'csv',
      clickedRow: {},
      leftTable: {
        tableConfig: {
          url: '/api/v1/applications/applications/',
          columns: [
            'name', 'category_display', 'type_display', 'comment', 'org_name'
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
            vm.rightTable.tableConfig.extraQuery.application_id = row.id
            vm.clickedRow = row
            vm.MFAInfo.application = row.name
            vm.isInit = false
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
          extraQuery: {
            application_id: ''
          },
          columns: [
            'name', 'username', 'username_same_with_user', 'protocol', 'login_mode', 'priority', 'comment', 'org_name', 'actions'
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
                      this.dialogStatus = 'viewAuthInfo'
                      this.MFAInfo.systemUser = val.row
                      if (!this.needMFAVerify) {
                        this.showMFADialog = true
                        this.MFAConfirmed = true
                        this.$axios.get(`/api/v1/assets/system-users/${this.MFAInfo.systemUser.id}/auth-info/`).then(res => {
                          this.MFAConfirmed = true
                          this.MFAInfo.username = res.username
                          if (res.protocol === 'k8s') {
                            this.MFAInfo.password = res.token
                          } else {
                            this.MFAInfo.password = res.password
                          }
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
          hasImport: false,
          handleExport({ selectedRows }) {
            vm.selectedRows = selectedRows
            vm.dialogStatus = 'export'
            if (!vm.needMFAVerify) {
              vm.showMFADialog = false
              vm.showExportDialog = true
            } else {
              vm.showMFADialog = true
            }
          }
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
    },
    exportOptions() {
      return [
        {
          label: this.$t('common.imExport.ExportAll'),
          value: 'all',
          can: true
        },
        {
          label: this.$t('common.imExport.ExportOnlySelectedItems'),
          value: 'selected',
          can: this.selectedRows.length > 0
        }
      ]
    },
    exportTypeOptions() {
      return [
        {
          label: 'CSV',
          value: 'csv',
          can: true
        },
        {
          label: 'Excel',
          value: 'xlsx',
          can: true
        }
      ]
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
          if (this.dialogStatus === 'export') {
            this.showMFADialog = false
            this.showExportDialog = true
          } else {
            this.$axios.get(`/api/v1/assets/system-users/${this.MFAInfo.systemUser.id}/auth-info/`).then(res => {
              this.MFAConfirmed = true
              this.MFAInfo.username = res.username
              this.MFAInfo.password = res.password
            })
          }
        }
      )
    },
    downloadCsv(url) {
      const a = document.createElement('a')
      a.href = url
      a.click()
      window.URL.revokeObjectURL(url)
    },
    async performExport(selectRows, exportOption, q) {
      const url = `/api/v1/applications/application-user-auth-infos/`
      const query = Object.assign({}, q)
      if (exportOption === 'selected') {
        const resources = []
        const data = selectRows
        for (let index = 0; index < data.length; index++) {
          resources.push(data[index].id)
        }
        const spm = await createSourceIdCache(resources)
        query['spm'] = spm.spm
      } else if (exportOption === 'filtered') {
        // console.log(listTableRef)
        // console.log(listTableRef.dataTable)
        // delete query['limit']
        // delete query['offset']
      }
      query['format'] = this.exportTypeOption
      const queryStr =
          (url.indexOf('?') > -1 ? '&' : '?') +
          queryUtil.stringify(query, '=', '&')
      return this.downloadCsv(url + queryStr)
    },
    async performExportConfirm() {
      const listTableRef = this.$refs.RightTable.$refs.ListTable
      const query = listTableRef.dataTable.getQuery()
      delete query['limit']
      delete query['offset']
      return this.performExport(this.selectedRows, this.exportOption, query)
    },
    async handleExportConfirm() {
      await this.performExportConfirm()
      this.showExportDialog = false
    },
    handleExportCancel() {
      this.showExportDialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .application-table ::v-deep .row-clicked, .application-user-table ::v-deep .row-background-color {
    background-color: #f5f7fa;
  }

  .application-table {
    &:hover {
      cursor: pointer;
    }
    & ::v-deep .el-table__row{
      height: 40px;
      & > td{
        padding: 0;
      }
    }
  }

  .export-item {
    width: 100%;
    display: block;
    padding: 10px 20px;
  }

  .export-form >>> .el-form-item__label {
    line-height: 2
  }
  .application-user-table{
    padding-left:20px ;
  }
  .noDataR {
    width: 100%;
    height: 40vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-direction: column;
    .hintWrap {
      color: #D4D6E6;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      flex-direction: column;
    }
  }

</style>
