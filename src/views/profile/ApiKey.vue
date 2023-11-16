<template>
  <div>
    <GenericListPage
      ref="GenericListTable"
      :header-actions="headerActions"
      :help-message="helpMessage"
      :table-config="tableConfig"
    />
    <Dialog
      :show-cancel="false"
      :title="$tc('profile.CreateAccessKey')"
      :visible.sync="visible"
      width="700px"
      @close="onClose"
      @confirm="visible = false"
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
import { ArrayFormatter, DateFormatter } from '@/components/Table/TableFormatters'
import Dialog from '@/components/Dialog/index.vue'

export default {
  components: {
    Dialog,
    GenericListPage
  },
  data() {
    const ajaxUrl = '/api/v1/authentication/access-keys/'
    return {
      mfaUrl: '',
      mfaDialogVisible: false,
      helpMessage: this.$t('setting.helpText.ApiKeyList'),
      warningText: this.$t('profile.ApiKeyWarning'),
      visible: false,
      key: { id: '', secret: '' },
      tableConfig: {
        hasSelection: true,
        url: ajaxUrl,
        columns: ['id', 'secret', 'ip_group', 'is_active', 'date_created', 'date_last_used', 'actions'],
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
          ip_group: {
            label: this.$t('profile.AccessIP'),
            formatter: ArrayFormatter
          },
          actions: {
            formatterArgs: {
              hasClone: false,
              updateRoute: 'ApiKeyCreateUpdate',
              onDelete: function({ row }) {
                this.$axios.delete(`${ajaxUrl}${row.id}/`).then(res => {
                  this.reloadTable()
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
                      this.reloadTable()
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
              this.$axios.post(ajaxUrl).then(res => {
                this.key = res
                this.visible = true
              })
            }.bind(this)
          }
        ]
      }
    }
  },
  methods: {
    onClose() {
      this.reloadTable()
    },
    reloadTable() {
      this.$refs.GenericListTable.reloadTable()
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
