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
        extraMoreActions: [
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
            [this.$t('users.Account'), ['groups']],
            [this.$t('users.Secure'), ['date_expired']],
            [this.$t('common.Other'), ['comment']]
          ],
          url: '/api/v1/users/users/',
          fieldsMeta: {
            groups: {
              el: {
                multiple: true,
                ajax: {
                  url: '/api/v1/users/groups/'
                },
                value: []
              }
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
    }
  }
}
</script>

<style lang="less" scoped>

</style>
