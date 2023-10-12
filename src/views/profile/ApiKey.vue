<template>
  <div>
    <GenericListPage
      ref="GenericListTable"
      :header-actions="headerActions"
      :help-message="helpMessage"
      :table-config="tableConfig"
    />
    <UserConfirmDialog
      v-if="mfaDialogVisible"
      :handler="createAccessKey"
      @close="mfaDialogVisible = false"
      @onConfirmDone="showAccessKeyDialog"
    />
    <Dialog
      :show-cancel="false"
      :title="$tc('profile.CreateAccessKey')"
      :visible.sync="visible"
      width="700px"
      @close="onClose"
      @confirm="onConfirm"
    >
      <el-alert type="warning">
        {{ warningText }}
        <div class="secret">
          <div class="row">
            <span class="col">ID:</span>
            <span class="value">{{ key.id }}</span>
          </div>
          <div class="row">
            <span class="col">Secret:</span>
            <span class="value">{{ key.secret }}</span>
          </div>
        </div>
      </el-alert>
    </Dialog>
  </div>
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DateFormatter } from '@/components/Table/TableFormatters'
import Dialog from '@/components/Dialog/index.vue'
import UserConfirmDialog from '@/components/Apps/UserConfirmDialog/index.vue'

export default {
  components: {
    UserConfirmDialog,
    Dialog,
    GenericListPage
  },
  data() {
    const ajaxUrl = '/api/v1/authentication/access-keys/'
    const vm = this
    return {
      mfaUrl: '',
      mfaDialogVisible: false,
      createAccessKey: () => vm.$axios.post(ajaxUrl),
      helpMessage: this.$t('setting.helpText.ApiKeyList'),
      warningText: this.$t('profile.ApiKeyWarning'),
      visible: false,
      key: { id: '', secret: '' },
      tableConfig: {
        hasSelection: true,
        url: ajaxUrl,
        columns: ['id', 'secret', 'is_active', 'date_created', 'date_last_used', 'actions'],
        columnsShow: {
          min: ['id', 'actions']
        },
        columnsMeta: {
          id: {
            label: 'ID'
          },
          secret: {
            label: 'Secret',
            formatter: () => {
              return '********'
            }
          },
          date_created: {
            label: this.$t('common.DateCreated'),
            formatter: DateFormatter
          },
          actions: {
            formatterArgs: {
              hasUpdate: false,
              hasClone: false,
              onDelete: function({ row }) {
                this.$axios.delete(`${ajaxUrl}${row.id}/`).then(res => {
                  this.getRefsListTable.reloadTable()
                  this.$message.success(this.$tc('common.deleteSuccessMsg'))
                }).catch(error => {
                  this.$message.error(this.$tc('common.deleteErrorMsg') + ' ' + error)
                })
              }.bind(this),
              extraActions: [
                {
                  name: 'Enabled',
                  title: ({ row }) => {
                    return row.is_active ? this.$t('common.Disable') : this.$t('common.Enable')
                  },
                  type: 'info',
                  can: () => this.$hasPerm('authentication.change_accesskey'),
                  callback: function({ row }) {
                    this.$axios.patch(`${ajaxUrl}${row.id}/`,
                      { is_active: !row.is_active }
                    ).then(res => {
                      this.getRefsListTable.reloadTable()
                      this.$message.success(this.$tc('common.updateSuccessMsg'))
                    }).catch(error => {
                      this.$message.error(this.$t('common.updateErrorMsg') + ' ' + error)
                    })
                  }.bind(this)
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasMoreActions: false,
        hasExport: false,
        hasImport: false,
        hasBulkDelete: false,
        hasCreate: false,
        extraActions: [
          {
            name: this.$t('setting.Create'),
            title: this.$t('setting.Create'),
            type: 'primary',
            can: () => this.$hasPerm('authentication.add_accesskey'),
            callback: function() {
              this.mfaDialogVisible = false
              setTimeout(() => {
                this.mfaDialogVisible = true
              }, 100)
            }.bind(this)
          }
        ]
      }
    }
  },
  computed: {
    getRefsListTable() {
      return this.$refs.GenericListTable.$refs.ListTable.$refs.ListTable || {}
    }
  },
  methods: {
    showAccessKeyDialog(res) {
      this.key = res
      this.visible = true
      setTimeout(() => {
        this.mfaDialogVisible = false
      })
    },
    onClose() {
      this.getRefsListTable.reloadTable()
    },
    onConfirm() {
      this.visible = false
      this.getRefsListTable.reloadTable()
    }
  }
}
</script>

<style scoped>
.secret {
  color: #2b2f3a;
  margin-top: 20px;
}

.row {
  margin-bottom: 10px;
}

.col {
  width: 100px;
  text-align: left;
  display: inline-block;
}

.value {
  font-weight: 600;
}
</style>
