<template>
  <GenericListPage
    ref="GenericListTable"
    :header-actions="headerActions"
    :help-tip="helpMessage"
    :table-config="tableConfig"
  />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    const ajaxUrl = '/api/v1/authentication/access-tokens/'
    return {
      helpMessage: this.$t('AccessTokenTip'),
      tableConfig: {
        hasSelection: false,
        url: ajaxUrl,
        columns: [
          'token_preview', 'scope', 'is_valid', 'expires', 'updated', 'created', 'actions'
        ],
        columnsMeta: {
          actions: {
            prop: '',
            formatterArgs: {
              hasUpdate: false,
              hasClone: false,
              hasDelete: false,
              extraActions: [
                {
                  name: 'Revoke',
                  title: this.$t('Revoke'),
                  can: ({ row }) => this.$hasPerm('oauth2_provider.delete_accesstoken'),
                  type: 'info',
                  callback: function({ row }) {
                    this.$axios.delete(`${ajaxUrl}${row.id}/revoke/`,
                    ).then(res => {
                      this.reloadTable()
                      this.$message.success(this.$tc('UpdateSuccessMsg'))
                    }).catch(error => {
                      this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + error))
                    })
                  }.bind(this)
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasSearch: false,
        hasRightActions: true,
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasBulkDelete: false,
        hasCreate: false,
        extraActions: []
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
