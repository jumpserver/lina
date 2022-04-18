<template>
  <GenericListPage
    ref="GenericListTable"
    :table-config="tableConfig"
    :header-actions="headerActions"
    :help-message="helpMessage"
  />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DateFormatter, ShowKeyCopyFormatter } from '@/components/TableFormatters'

export default {
  components: {
    GenericListPage
  },
  data() {
    const ajaxUrl = '/api/v1/authentication/access-keys/'
    return {
      helpMessage: this.$t('setting.helpText.ApiKeyList'),
      tableConfig: {
        hasSelection: true,
        url: ajaxUrl,
        columns: [
          'id', 'secret', 'is_active', 'date_created', 'actions'
        ],
        columnsMeta: {
          id: {
            label: 'AccessKeyID'
          },
          secret: {
            label: 'AccessKeySecret',
            formatter: ShowKeyCopyFormatter
          },
          date_created: {
            label: this.$t('common.dateCreated'),
            showOverflowTooltip: true,
            formatter: DateFormatter
          },
          actions: {
            prop: '',
            formatterArgs: {
              hasUpdate: false,
              hasClone: false,
              onDelete: function({ row }) {
                this.$axios.delete(`${ajaxUrl}${row.id}/`).then(res => {
                  this.getRefsListTable.reloadTable()
                  this.$message.success(this.$t('common.deleteSuccessMsg'))
                }).catch(error => {
                  this.$message.error(this.$t('common.deleteErrorMsg') + ' ' + error)
                })
              }.bind(this),
              extraActions: [
                {
                  name: 'Enabled',
                  title: this.$t('common.On/Off'),
                  type: 'info',
                  can: () => this.$hasPerm('authentication.change_accesskey'),
                  callback: function({ row }) {
                    this.$axios.patch(`${ajaxUrl}${row.id}/`,
                      { is_active: !row.is_active }
                    ).then(res => {
                      this.getRefsListTable.reloadTable()
                      this.$message.success(this.$t('common.updateSuccessMsg'))
                    }).catch(error => {
                      this.$message.error(this.$t('common.updateErrorMsg' + ' ' + error))
                    })
                  }.bind(this)
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasSearch: true,
        hasRightActions: true,
        hasRefresh: true,
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
                this.getRefsListTable.reloadTable()
                this.$message.success(this.$t('common.updateSuccessMsg'))
              }).catch(error => {
                this.$message.error(this.$t('common.updateErrorMsg' + ' ' + error))
              })
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
  }
}
</script>

<style scoped>
</style>
