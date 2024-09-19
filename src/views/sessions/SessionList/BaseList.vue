<template>
  <ListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script type="text/jsx">
import ListTable from '@/components/Table/ListTable'
import { timeOffset } from '@/utils/time'
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
    }
  },
  data() {
    return {
      tableConfig: {
        url: this.url,
        columnsExclude: ['terminal'],
        columnsShow: this.columnsShow,
        columnsMeta: {
          id: {
            prop: 'id',
            label: this.$t('Number'),
            align: 'center',
            formatter: function(row, column, cellValue, index) {
              const label = index + 1
              const route = { to: { name: 'SessionDetail', params: { id: row.id }}}
              return <router-link {...{ attrs: route }} class='link'>{label}</router-link>
            }
          },
          user: {
            formatter: DetailFormatter,
            formatterArgs: {
              getRoute: ({ row }) => {
                return {
                  name: 'UserDetail',
                  params: {
                    id: row['user_id']
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
              getRoute: ({ row }) => {
                return {
                  name: 'AssetDetail',
                  params: {
                    id: row['asset_id']
                  }
                }
              }
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
            width: '130px',
            formatter: ActionsFormatter,
            formatterArgs: {
              hasEdit: false,
              hasClone: false,
              hasDelete: false,
              hasUpdate: false,
              extraActions: this.extraActions
            }
          }
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
  }
}
</script>

<style scoped>
.link {
  color: var(--color-info);
}
</style>
