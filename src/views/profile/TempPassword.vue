<template>
  <GenericListPage
    ref="GenericListTable"
    :header-actions="headerActions"
    :help-message="helpMessage"
    :table-config="tableConfig"
  />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { ShowKeyCopyFormatter } from '@/components/Table/TableFormatters'

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
            label: this.$t('common.nav.TempPassword'),
            formatter: ShowKeyCopyFormatter
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
                  can: ({ row }) => row['is_valid'] && this.$hasPerm('authentication.change_temptoken'),
                  type: 'info',
                  callback: function({ row }) {
                    this.$axios.patch(`${ajaxUrl}${row.id}/expire/`,
                    ).then(res => {
                      this.reloadTable()
                      this.$message.success(this.$tc('common.updateSuccessMsg'))
                    }).catch(error => {
                      this.$message.error(this.$tc('common.updateErrorMsg' + ' ' + error))
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
            can: this.$hasPerm('authentication.add_temptoken'),
            callback: function() {
              this.$axios.post(
                `/api/v1/authentication/temp-tokens/`
              ).then(res => {
                this.reloadTable()
                this.$message.success(this.$tc('common.updateSuccessMsg'))
              }).catch(error => {
                this.$message.error(this.$tc('common.updateErrorMsg' + ' ' + error))
              })
            }.bind(this)
          }
        ]
      }
    }
  },
  methods: {
    reloadTable() {
      this.$refs.GenericListTable.reloadTable()
    }
  }
}
</script>

<style scoped>
</style>
