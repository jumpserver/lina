<template>
  <ListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script type="text/jsx">
import ListTable from '@/components/Table/ListTable'
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'

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
            'id', 'user', 'asset', 'account', 'remote_addr', 'protocol',
            'command_amount', 'date_start', 'duration', 'actions'
          ]
        }
      }
    }
  },
  data() {
    return {
      tableConfig: {
        url: this.url,
        columnsExtra: ['index'],
        columnsExclude: ['terminal'],
        columnsShow: this.columnsShow,
        columnsMeta: {
          id: {
            prop: 'id',
            label: this.$t('common.Number'),
            align: 'center',
            width: '80px',
            formatter: function(row, column, cellValue, index) {
              const label = index + 1
              const route = { to: { name: 'SessionDetail', params: { id: row.id }}}
              return <router-link {...{ attrs: route }} class='link'>{ label }</router-link>
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
            width: '86px',
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
            label: this.$t('sessions.target'),
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
          command_amount: {
            width: '90px'
          },
          login_from: {
            width: '115px'
          },
          remote_addr: {
            width: '140px'
          },
          protocol: {
            label: this.$t('sessions.protocol'),
            width: '80px',
            sortable: false,
            formatter: null
          },
          date_start: {
            width: '150px'
          },
          date_end: {
            width: '150px'
          },
          duration: {
            width: '80px'
          },
          is_locked: {
            label: this.$t('sessions.is_locked')
          },
          actions: {
            prop: 'actions',
            label: this.$t('common.Actions'),
            width: '160px',
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
  },
  methods: {
  }
}
</script>

<style scoped>
  .link {
    color: var(--color-info);
  }
</style>
