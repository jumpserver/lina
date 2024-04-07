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
import { ShowKeyCopyFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'ConnectionToken',
  components: {
    GenericListPage
  },
  data() {
    const ajaxUrl = '/api/v1/authentication/connection-token/'
    return {
      helpMessage: this.$t('ConnectionTokenList'),
      tableConfig: {
        url: ajaxUrl,
        columnsExtra: ['action'],
        columnsShow: {
          min: ['id', 'actions'],
          default: [
            'id', 'type_display', 'date_expired', 'is_valid', 'actions'
          ]
        },
        columnsMeta: {
          id: {
            label: 'Token ID',
            formatter: ShowKeyCopyFormatter
          },
          action: {
            label: this.$t('Action'),
            formatter: function(row) {
              return row.actions.map(item => {
                return item.label
              }).join(', ')
            }
          },
          actions: {
            formatterArgs: {
              hasUpdate: false,
              hasClone: false,
              hasDelete: false,
              extraActions: [
                {
                  name: 'Expired',
                  title: this.$t('Expire'),
                  type: 'info',
                  can: ({ row }) => !row['is_expired'] && this.$hasPerm('authentication.expire_connectiontoken'),
                  callback: function({ row }) {
                    this.$axios.patch(`${ajaxUrl}${row.id}/expire/`,
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
  },
  methods: {
    reloadTable() {
      return this.$refs.GenericListTable.reloadTable()
    }
  }
}
</script>

<style scoped>

</style>
