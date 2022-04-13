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

export default {
  components: {
    GenericListPage
  },
  data() {
    const ajaxUrl = '/api/v1/authentication/temp-tokens/'
    return {
      helpMessage: this.$t('setting.helpText.TempPassword'),
      tableConfig: {
        hasSelection: true,
        url: ajaxUrl,
        columns: [
          'username', 'secret', 'date_expired', 'date_verified', 'is_valid', 'actions'
        ],
        columnsMeta: {
          secret: {
            label: this.$t('common.nav.TempPassword')
          },
          expire: {
            label: this.$t('setting.Expired') + '( s )'
          },
          actions: {
            prop: '',
            formatterArgs: {
              hasUpdate: false,
              hasClone: false,
              hasDelete: false,
              extraActions: [
                {
                  name: 'Expired',
                  title: this.$t('setting.Expire'),
                  type: 'info',
                  callback: function({ row }) {
                    this.$axios.patch(`${ajaxUrl}${row.id}/expire/`,
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
        hasSearch: false,
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
                `/api/v1/authentication/temp-tokens/`
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
