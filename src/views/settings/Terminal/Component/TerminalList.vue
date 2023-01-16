<template>
  <div>
    <ListTable :table-config="tableConfig" :header-actions="headerActions" />
  </div>
</template>

<script>
import ListTable from '@/components/ListTable'

export default {
  components: {
    ListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/terminal/terminals/',
        permissions: {
          app: 'terminal',
          resource: 'terminal'
        },
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'session_online', 'stat',
            'load', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            sortable: 'custom',
            formatterArgs: {
              route: 'TerminalDetail'
            }
          },
          stat: {
            label: this.$t('terminal.TerminalStat'),
            formatter: (row) => {
              if (!row?.stat) {
                return ''
              }
              const stat = row.stat
              return `${stat['cpu_load']} / ${stat['memory_used']}% / ${stat['disk_used']}%`
            }
          },
          load: {
            label: this.$t('xpack.LoadStatus'),
            filterable: 'custom',
            formatterArgs: {
              classChoices: {
                offline: 'fa fa-chain-broken text-danger',
                critical: 'fa fa-bolt text-warning',
                high: 'fa fa-exclamation-triangle text-info',
                normal: 'fa fa-check text-primary'
              }
            }
          },
          remote_addr: {
            sortable: 'custom'
          },
          is_active: {
            label: this.$t('sessions.active'),
            width: '80px',
            align: 'center'
          },
          is_alive: {
            label: this.$t('sessions.alive')
          },
          session_online: {
            label: this.$t('sessions.session'),
            width: '80px'
          },
          actions: {
            formatterArgs: {
              hasClone: false,
              updateRoute: { name: 'TerminalUpdate' }
            }
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasUpload: false,
        hasExport: false,
        hasImport: false,
        hasUpdate: false,
        extraActions: [],
        hasBulkUpdate: true,
        canBulkUpdate: ({ selectedRows }) => {
          return selectedRows.length > 0 && vm.$hasPerm('terminal.change_terminal')
        },
        handleBulkUpdate: ({ selectedRows }) => {
          this.dialogSettings.selectedRows = selectedRows
          this.dialogSettings.visible = true
        }
      }
    }
  }
}
</script>

<style>
</style>
