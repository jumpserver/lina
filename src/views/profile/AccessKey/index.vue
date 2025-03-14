<template>
  <div>
    <GenericListPage
      ref="GenericListPage"
      :create-drawer="createDrawer"
      :header-actions="headerActions"
      :help-tip="helpMessage"
      :table-config="tableConfig"
    />
    <SecretDialog ref="secretDialog" @close="onClose" />
  </div>
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { ArrayFormatter, DateFormatter } from '@/components/Table/TableFormatters'
import SecretDialog from '@/components/Dialog/Secret.vue'

export default {
  components: {
    SecretDialog,
    GenericListPage
  },
  data() {
    const ajaxUrl = '/api/v1/authentication/access-keys/'
    return {
      createDrawer: () => import('@/views/profile/AccessKey/CreateUpdate'),
      mfaUrl: '',
      mfaDialogVisible: false,
      helpMessage: this.$t('ApiKeyList'),
      warningText: this.$t('ApiKeyWarning'),
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
            label: this.$t('DateCreated'),
            formatter: DateFormatter
          },
          ip_group: {
            label: this.$t('AccessIP'),
            formatter: ArrayFormatter
          },
          actions: {
            formatterArgs: {
              hasClone: false,
              updateRoute: 'AccessKeyCreateUpdate',
              onDelete: function({ row }) {
                this.$axios.delete(`${ajaxUrl}${row.id}/`).then(res => {
                  this.reloadTable()
                  this.$message.success(this.$tc('DeleteSuccessMsg'))
                }).catch(error => {
                  this.$message.error(this.$tc('DeleteErrorMsg') + ' ' + error)
                })
              }.bind(this),
              extraActions: [
                {
                  name: 'Enabled',
                  title: ({ row }) => {
                    return row.is_active ? this.$t('Disable') : this.$t('Enable')
                  },
                  type: 'info',
                  can: () => this.$hasPerm('authentication.change_accesskey'),
                  callback: function({ row }) {
                    this.$axios.patch(`${ajaxUrl}${row.id}/`,
                      { is_active: !row.is_active }
                    ).then(res => {
                      this.reloadTable()
                      this.$message.success(this.$tc('UpdateSuccessMsg'))
                    }).catch(error => {
                      this.$message.error(this.$t('UpdateErrorMsg') + ' ' + error)
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
            name: this.$t('Create'),
            title: this.$t('Create'),
            type: 'primary',
            can: () => this.$hasPerm('authentication.add_accesskey'),
            callback: function() {
              this.$axios.post(ajaxUrl).then(res => {
                this.$refs.secretDialog.show(res)
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
      this.$refs.GenericListPage.reloadTable()
    }
  }
}
</script>
