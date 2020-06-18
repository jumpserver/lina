<template>
  <div>
    <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
    <GenericUpdateFormDialog
      :selected-rows="updateSelectedDialogSetting.selectedRows"
      :form-setting="updateSelectedDialogSetting.formSetting"
      :dialog-setting="updateSelectedDialogSetting.dialogSetting"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { GenericListPage } from '@/layout/components'
import { GenericUpdateFormDialog } from '@/layout/components'
import { createSourceIdCache } from '@/api/common'

export default {
  components: {
    GenericListPage,
    GenericUpdateFormDialog
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/users/users/',
        columns: [
          'name', 'username', 'groups_display', 'role', 'source', 'is_valid', 'actions'
        ],
        columnsMeta: {
          source: {
            width: '120px'
          },
          // role: {
          //   width: '100px'
          // },
          groups_display: {
            width: '200px',
            showOverflowTooltip: true
          },
          actions: {
            formatterArgs: {
              hasDelete: () => this.currentOrgIsDefault,
              extraActions: [
                {
                  title: this.$t('users.Remove'),
                  name: 'remove',
                  type: 'warning',
                  has: () => !this.currentOrgIsDefault,
                  callback: this.removeUserFromOrg
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasBulkDelete: false,
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
            date_expired: '2099-12-31 00:00:00 +0800'
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
      }
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
    }
  }
}
</script>

<style lang="less" scoped>

</style>
