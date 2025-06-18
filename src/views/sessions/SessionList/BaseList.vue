<template>
  <ListTable
    :detail-drawer="detailDrawer"
    :header-actions="headerActions"
    :table-config="tableConfig"
  />
</template>

<script type="text/jsx">
import { DrawerListTable as ListTable } from '@/components'
import { timeOffset } from '@/utils/common/time'
import { ActionsFormatter, ChoicesFormatter, DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'BaseList',
  components: {
    ListTable
  },
  props: {
    url: {
      type: String,
      default: () => '/api/v1/terminal/sessions/'
    },
    extraActions: {
      type: Array,
      default: () => []
    },
    columnsShow: {
      type: Object,
      default: () => {
        return {
          min: ['id', 'actions'],
          default: [
            'id', 'user', 'asset', 'account', 'protocol',
            'date_start', 'actions'
          ]
        }
      }
    },
    columnsMeta: {
      type: Object,
      default: () => {
      }
    },
    columnsExclude: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      detailDrawer: () => import('../SessionDetail/index.vue'),
      tableConfig: {
        url: this.url,
        columnsExclude: ['terminal', ...this.columnsExclude],
        columnsShow: this.columnsShow,
        columnsMeta: {
          id: {
            prop: 'id',
            label: this.$t('Number'),
            width: '80px',
            align: 'center',
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              can: this.$hasPerm('assets.view_asset'),
              getTitle: ({ row, col, cellValue, index }) => {
                return index + 1
              },
              getDrawerTitle: ({ row }) => {
                return row.id
              },
              getRoute: ({ row }) => {
                return {
                  name: 'SessionDetail',
                  params: { id: row.id }
                }
              }
            }
          },
          user: {
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              getTitle: ({ row }) => {
                return row.user
              },
              getRoute: ({ row }) => {
                return {
                  name: 'UserDetail',
                  params: {
                    id: row.user_id
                  }
                }
              }
            }
          },
          can_join: {
            formatterArgs: {
              showFalse: false
            }
          },
          can_replay: {
            formatterArgs: {
              showFalse: false
            }
          },
          can_terminate: {
            formatterArgs: {
              showFalse: false
            }
          },
          has_command: {
            formatterArgs: {
              showFalse: false
            }
          },
          is_finished: {
            formatterArgs: {
              showFalse: false
            }
          },
          has_replay: {
            formatterArgs: {
              showFalse: false
            }
          },
          asset: {
            label: this.$t('Target'),
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              can: this.$hasPerm('assets.view_asset'),
              getTitle: ({ row }) => row.asset,
              getRoute: ({ row }) => ({
                name: 'AssetDetail',
                params: { id: row.asset_id },
                query: { tab: 'Basic' }
              })
            }
          },
          protocol: {
            sortable: false,
            formatter: null
          },
          duration: {
            label: this.$t('Duration'),
            formatter: function(row) {
              return timeOffset(row.date_start, row.date_end)
            }
          },
          is_locked: {
            label: this.$t('IsLocked'),
            formatter: ChoicesFormatter,
            formatterArgs: {
              showFalse: true
            }
          },
          actions: {
            prop: 'actions',
            label: this.$t('Actions'),
            width: this.dynamicActionWidth,
            formatter: ActionsFormatter,
            formatterArgs: {
              hasEdit: false,
              hasClone: false,
              hasDelete: false,
              hasUpdate: false,
              extraActions: this.extraActions
            }
          },
          ...this.columnsMeta
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasDatePicker: true,
        searchConfig: {
          getUrlQuery: false,
          exclude: ['is_finished']
        }
      }
    }
  },
  computed: {
    dynamicActionWidth() {
      if (this.$i18n.locale === 'pt-br') {
        return '160px'
      }
      return '130px'
    }
  }
}
</script>

<style scoped>
.link {
  color: var(--color-info);
}
</style>
