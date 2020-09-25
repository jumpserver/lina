<template>
  <div>
    <GenericListPage
      :table-config="tableConfig"
      :header-actions="headerActions"
    />
    <GenericUpdateFormDialog
      :selected-rows="updateSelectedDialogSetting.selectedRows"
      :form-setting="updateSelectedDialogSetting.formSetting"
      :dialog-setting="updateSelectedDialogSetting.dialogSetting"
    />
    <Dialog
      v-if="investDialogVisible"
      title="Invite a collaborator to OmniDB"
      :visible.sync="investDialogVisible"
      custom-class="asset-select-dialog"
      :show-cancel="false"
      :show-confirm="false"
      width="28%"
      top="15vh"
      after
      :destroy-on-close="true"
      @close="clearSelect"
    >
      <div>
        <el-select
          v-model="investValue"
          multiple
          filterable
          remote
          size="small"
          reserve-keyword
          placeholder="请输入关键词"
          :remote-method="remoteMethod"
          :loading="selectLoading"
        >
          <el-option
            v-for="item in investOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-collapse-transition>
          <div
            v-if="investValue.length>0"
            style="margin-top:15px;
                   display: flex;
                   flex-direction:column;
                   align-items:center;
                   justify-content:center;"
          >
            <el-checkbox-group
              v-model="rulesList"
              size="small"
              style="display: flex;
                   flex-direction:row;
                   justify-content:center;"
            >
              <el-checkbox label="用户" checked />
              <el-checkbox label="组织审计员" />
              <el-checkbox label="组织管理员" />
            </el-checkbox-group>

            <el-button type="primary" size="small" style="margin-top: 20px;width: 10vw" @click="investConfirm">邀请</el-button>
          </div>
        </el-collapse-transition>
      </div>
    </Dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { GenericListPage } from '@/layout/components'
import { GenericUpdateFormDialog } from '@/layout/components'
import Dialog from '@/components/Dialog'
import { createSourceIdCache } from '@/api/common'
import { getDayFuture } from '@/utils/common'

export default {
  components: {
    GenericListPage,
    GenericUpdateFormDialog,
    Dialog
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/users/users/',
        columns: [
          'name', 'username', 'groups_display', 'total_role_display', 'source', 'is_valid', 'actions'
        ],
        columnsMeta: {
          username: {
            showOverflowTooltip: true
          },
          source: {
            width: '120px'
          },
          total_role_display: {
            label: this.$t('users.Role')
          },
          groups_display: {
            width: '200px',
            showOverflowTooltip: true
          },
          actions: {
            formatterArgs: {
              hasDelete: () => this.currentOrgIsDefault,
              canUpdate: function(row, cellValue) {
                return row.can_update
              },
              canDelete: function(row, cellValue) {
                return row.can_delete
              },
              extraActions: [
                {
                  title: this.$t('users.Remove'),
                  name: 'remove',
                  type: 'warning',
                  has: () => !this.currentOrgIsDefault,
                  can: function(row, cellValue) {
                    return row.can_delete
                  },
                  callback: this.removeUserFromOrg
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasBulkDelete: false,
        extraActions: [
          {
            name: '邀请用户',
            title: '邀请用户',
            can: !this.currentOrgIsDefault,
            callback: function() {
              this.investDialogVisible = true
            }.bind(this)
          }
        ],
        extraMoreActions: [
          {
            title: this.$t('common.deleteSelected'),
            name: 'deleteSelected',
            can({ selectedRows }) {
              return selectedRows.length > 0
            },
            callback: this.bulkDeleteCallback.bind(this)
          },
          {
            name: 'disableSelected',
            title: this.$t('common.disableSelected'),
            can({ selectedRows }) {
              return selectedRows.length > 0
            },
            callback({ selectedRows, reloadTable }) {
              const url = '/api/v1/users/users/'
              const data = selectedRows.map(row => {
                return { id: row.id, is_active: false }
              })
              if (data.length === 0) {
                return
              }
              vm.$axios.patch(url, data).then(() => {
                reloadTable()
              })
            }
          },
          {
            name: 'activateSelected',
            title: this.$t('common.activateSelected'),
            can: ({ selectedRows }) => selectedRows.length > 0,
            callback: ({ selectedRows, reloadTable }) => {
              const url = '/api/v1/users/users/'
              const data = selectedRows.map(row => {
                return { id: row.id, is_active: true }
              })
              if (data.length === 0) {
                return
              }
              vm.$axios.patch(url, data).then(() => {
                reloadTable()
              })
            }
          },
          {
            name: 'updateSelected',
            title: this.$t('common.updateSelected'),
            can: ({ selectedRows }) => selectedRows.length > 0,
            callback: ({ selectedRows, reloadTable }) => {
              vm.updateSelectedDialogSetting.dialogSetting.dialogVisible = true
              vm.updateSelectedDialogSetting.selectedRows = selectedRows
            }
          }
        ]
      },
      updateSelectedDialogSetting: {
        selectedRows: [],
        dialogSetting: {
          dialogVisible: false
        },
        formSetting: {
          initial: {
            date_expired: getDayFuture(36500, new Date()).toISOString()
          },
          fields: [
            'groups', 'date_expired', 'comment'
          ],
          url: '/api/v1/users/users/',
          fieldsMeta: {
            groups: {
              label: this.$t('users.UserGroups'),
              hidden: () => false,
              el: {
                multiple: true,
                ajax: {
                  url: '/api/v1/users/groups/'
                },
                value: []
              }
            },
            date_expired: {
              label: this.$t('common.dateExpired'),
              hidden: () => false

            },
            comment: {
              label: this.$t('common.Comment'),
              hidden: () => false

            }
          }
        }
      },
      investDialogVisible: false,
      selectLoading: false,
      investOptions: [],
      investValue: [],
      rulesList: []
    }
  },
  computed: {
    ...mapGetters([
      'currentOrg',
      'currentUser',
      'device'
    ]),
    currentOrgIsDefault() {
      return this.currentOrg.id === 'DEFAULT' || this.currentOrg.id === ''
    }
  },
  mounted() {
    if (!this.currentOrgIsDefault) {
      this.headerActions.extraMoreActions[0].title = this.$t('common.removeSelected')
    }
  },
  methods: {
    removeUserFromOrg({ row, col, reload }) {
      const msg = this.$t('users.removeFromOrgWarningMsg') + ' "' + row.name + '"'
      const title = this.$t('common.Info')
      const performDelete = function() {
        const url = `/api/v1/users/users/${row.id}/`
        return this.$axios.delete(url)
      }
      this.$alert(msg, title, {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        showCancelButton: true,
        beforeClose: async(action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          try {
            await performDelete.bind(this)({ row: row, col: col })
            done()
            reload()
            this.$message.success(this.$t('common.removeSuccessMsg'))
          } catch (error) {
            this.$message.error(this.$t('common.removeErrorMsg' + ' ' + error))
          } finally {
            instance.confirmButtonLoading = false
          }
        }
      })
    },
    bulkDeleteCallback({ selectedRows, reloadTable }) {
      let msgPrefix = this.$t('common.deleteWarningMsg')
      if (!this.currentOrgIsDefault) {
        msgPrefix = this.$t('common.removeWarningMsg')
      }
      const msg = msgPrefix + ' ' + selectedRows.length + ' ' + this.$t('common.rows') + ' ?'
      const title = this.$t('common.Info')
      const performDelete = this.performBulkDelete
      this.$alert(msg, title, {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        showCancelButton: true,
        beforeClose: async(action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          try {
            await performDelete(selectedRows)
            done()
            reloadTable()
            let successMsg = this.$t('common.bulkDeleteSuccessMsg')
            if (!this.currentOrgIsDefault) {
              successMsg = this.$t('common.bulkRemoveSuccessMsg')
            }
            this.$message.success(successMsg)
          } catch (error) {
            let errorMsg = this.$t('common.bulkDeleteErrorMsg')
            if (!this.currentOrgIsDefault) {
              errorMsg = this.$t('common.bulkRemoveErrorMsg')
            }
            this.$message.error(errorMsg + error)
          } finally {
            instance.confirmButtonLoading = false
          }
        }
      }).catch(() => {
        /* 取消*/
      })
    },
    async performBulkDelete(selectedRows) {
      const ids = selectedRows.map((v) => {
        return v.id
      })
      const data = await createSourceIdCache(ids)
      const url = `${this.tableConfig.url}?spm=` + data.spm
      return this.$axios.delete(url)
    },
    remoteMethod(query) {
      if (query !== '') {
        this.investOptions = []
        this.selectLoading = true
        this.$axios.get(` /api/v1/users/users/?search=${query}&all=1`).then(result => {
          console.log(result)
          for (let i = 0; i < result.length; i++) {
            this.investOptions.push({
              value: result[i].id,
              label: result[i].name + '(' + result[i].username + ')'
            })
          }
        }).finally(() => { this.selectLoading = false })
      } else {
        this.investOptions = []
      }
    },
    clearSelect() {
      this.investValue = []
      this.rulesList = []
    },
    investConfirm() {
      console.log(this.rulesList, 'rulesList')
    }
  }
}
</script>

<style lang="less" scoped>
.asset-select-dialog ::v-deep .transition-box:first-child {
  background-color: #f3f3f3;
}
.dialog ::v-deep .el-input {
  width: 25.5vw;
}

.dialog ::v-deep .el-dialog__footer{
  padding: 0;
}
</style>
