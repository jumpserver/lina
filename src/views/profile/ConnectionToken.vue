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
import { ShowKeyCopyFormatter } from '@/components/TableFormatters'

export default {
  name: 'ConnectionToken',
  components: {
    GenericListPage
  },
  data() {
    const ajaxUrl = '/api/v1/authentication/connection-token/'
    return {
      helpMessage: '',
      tableConfig: {
        url: ajaxUrl,
        columns: [
          'id', 'secret', 'type_display',
          'user_display', 'system_user_display', 'asset_display', 'application_display',
          'date_expired', 'validity',
          'date_created', 'created_by', 'org_name',
          'actions'
        ],
        columnsShow: {
          min: ['id', 'actions'],
          default: [
            'id', 'secret', 'type_display', 'date_expired', 'validity', 'actions'
          ]
        },
        columnsMeta: {
          id: {
            formatter: ShowKeyCopyFormatter
          },
          secret: {
            formatter: ShowKeyCopyFormatter
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
        hasSearch: true,
        hasRightActions: true,
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasBulkDelete: false,
        hasCreate: false,
        extraActions: [
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
