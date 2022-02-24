<template>
  <GenericListPage
    ref="ListTable"
    :table-config="tableConfig"
    :header-actions="headerActions"
    :help-message="helpMessage"
  />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DateFormatter, ShowKeyFormatter } from '@/components/TableFormatters'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      helpMessage: this.$t('setting.helpText.ApiKeyList'),
      tableConfig: {
        hasSelection: true,
        url: `/api/v1/authentication/access-keys/`,
        columns: [
          'id', 'secret', 'is_active', 'date_created', 'actions'
        ],
        columnsMeta: {
          id: {
            label: 'AccessKeyID'
          },
          secret: {
            label: 'AccessKeySecret',
            formatter: ShowKeyFormatter
          },
          is_active: {
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
              onDelete: function({ row, col, cellValue, reload }) {
                this.$axios.delete(
                  `/api/v1/authentication/access-keys/${row.id}/`
                ).then(res => {
                  this.$refs.ListTable.reloadTable()
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
                  callback: function({ row, col, cellValue, reload }) {
                    this.$axios.patch(
                      `/api/v1/authentication/access-keys/${row.id}/`,
                      { is_active: !row.is_active }
                    ).then(res => {
                      this.$refs.ListTable.reloadTable()
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
            can: true,
            callback: function() {
              this.$axios.post(
                `/api/v1/authentication/access-keys/`
              ).then(res => {
                this.$refs.ListTable.reloadTable()
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
}
</script>

<style scoped>
</style>
