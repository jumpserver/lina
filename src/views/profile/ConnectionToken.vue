<template>
  <GenericListPage
    ref="GenericListTable"
    :header-actions="headerActions"
    :help-tip="helpMessage"
    :table-config="tableConfig"
  />
</template>

<script>
import { h } from 'vue'
import { GenericListPage } from '@/layout/components'
import { SecretViewerFormatter } from '@/components/Table/TableFormatters'

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
          min: ['id', 'actions', 'asset_display'],
          default: ['id', 'asset_display', 'date_expired', 'is_active', 'actions']
        },
        columnsMeta: {
          id: {
            label: 'Token ID',
            formatter: SecretViewerFormatter
          },
          comment: {
            showOverflowTooltip: {
              enterable: true,
              hideAfter: 200,
              popperOptions: {
                modifiers: [
                  { name: 'flip', options: { padding: 16 } },
                  {
                    name: 'preventOverflow',
                    options: { padding: 16, altAxis: true, tether: false }
                  }
                ]
              },
              popperStyle: {
                maxWidth: 'min(480px, calc(100vw - 32px))',
                boxSizing: 'border-box'
              }
            },
            tooltipFormatter: ({ cellValue }) =>
              h(
                'div',
                {
                  class: 'connection-token-comment-content',
                  style: {
                    marginRight: '-8px',
                    paddingRight: '8px',
                    maxHeight: 'calc(50vh - 32px)',
                    overflowY: 'auto',
                    overflowWrap: 'anywhere',
                    whiteSpace: 'pre-wrap',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--el-text-color-placeholder) transparent'
                  }
                },
                String(cellValue ?? '')
              )
          },
          action: {
            label: this.$t('PermAction'),
            formatter: function (row) {
              return row.actions
                .map((item) => {
                  return item.label
                })
                .join(', ')
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
                  can: ({ row }) =>
                    !row['is_expired'] && this.$hasPerm('authentication.expire_connectiontoken'),
                  callback: function ({ row }) {
                    this.$axios
                      .patch(`${ajaxUrl}${row.id}/expire/`)
                      .then((res) => {
                        this.reloadTable()
                        this.$message.success(this.$tc('UpdateSuccessMsg'))
                      })
                      .catch((error) => {
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
        extraActions: []
      }
    }
  },
  computed: {},
  methods: {
    reloadTable() {
      return this.$refs.GenericListTable.reloadTable()
    }
  }
}
</script>

<style>
.connection-token-comment-content::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.connection-token-comment-content::-webkit-scrollbar-track,
.connection-token-comment-content::-webkit-scrollbar-corner {
  background: transparent;
}

.connection-token-comment-content::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: var(--el-text-color-placeholder);
}
</style>
