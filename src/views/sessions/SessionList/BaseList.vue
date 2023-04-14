<template>
  <ListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script type="text/jsx">
import ListTable from '@/components/ListTable'
import { timeOffset } from '@/utils/common'
import { ActionsFormatter } from '@/components/TableFormatters'

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
    }
  },
  data() {
    return {
      tableConfig: {
        url: this.url,
        columnsExtra: ['index', 'duration'],
        columnsShow: {
          min: ['id', 'actions'],
          default: [
            'id', 'user', 'asset', 'account', 'remote_addr', 'protocol', 'login_from',
            'command_amount', 'date_start', 'duration', 'terminal_display', 'actions'
          ]
        },
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
            label: this.$t('sessions.target')
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
            label: this.$t('sessions.duration'),
            formatter: function(row) {
              return timeOffset(row.date_start, row.date_end)
            },
            width: '80px'
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
