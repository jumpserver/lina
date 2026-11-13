<template>
  <div>
    <ListTable
      ref="ListTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
      :create-drawer="createDrawer"
      :detail-drawer="detailDrawer"
    />
    <GenericUpdateFormDialog
      v-if="dialogSettings.visible"
      v-model:visible="dialogSettings.visible"
      :form-setting="dialogSettings.iFormSetting"
      :selected-rows="dialogSettings.selectedRows"
      :target-resource-setting="dialogSettings.targetResourceSetting"
      :title="$tc('TerminalUpdateStorage')"
      @update="handleBulkUpdateDone"
    />
  </div>
</template>

<script>
import Select2 from '@/components/Form/FormFields/Select2'

import { DrawerListTable as ListTable } from '@/components'
import { GenericUpdateFormDialog } from '@/layout/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { ObjectLocalStorage } from '@/utils/common/objectLocalStorage'

export default {
  components: {
    ListTable,
    GenericUpdateFormDialog
  },
  data() {
    const vm = this
    return {
      createDrawer: () => import('./TerminalUpdate.vue'),
      detailDrawer: () => import('./TerminalDetail/index.vue'),
      dialogSettings: {
        selectedRows: [],
        visible: false,
        targetResourceSetting: {
          label: this.$t('Component'),
          url: '/api/v1/terminal/terminals/?fields_size=mini',
          resourceName: this.$tc('Component', 2)
        },
        iFormSetting: {
          url: '/api/v1/terminal/terminals/',
          getUrl: () => '/api/v1/terminal/terminals/',
          fields: [['', ['command_storage', 'replay_storage']]],
          fieldsMeta: {
            command_storage: {
              label: this.$t('CommandStorage'),
              component: Select2,
              el: {
                ajax: {
                  url: '/api/v1/terminal/command-storages/'
                },
                multiple: false
              }
            },
            replay_storage: {
              label: this.$t('ReplayStorage'),
              component: Select2,
              el: {
                ajax: {
                  url: '/api/v1/terminal/replay-storages/?type_not=sftp'
                },
                multiple: false
              }
            }
          },
          hasSaveContinue: false
        }
      },
      tableConfig: {
        url: '/api/v1/terminal/terminals/',
        permissions: {
          app: 'terminal',
          resource: 'terminal'
        },
        columnsExclude: ['stat'],
        columnsExtra: ['cpu_load', 'memory_used', 'disk_used'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name',
            'session_online',
            'cpu_load',
            'memory_used',
            'disk_used',
            'load',
            'actions'
          ]
        },
        columnsMeta: {
          name: {
            sortable: 'custom',
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              getRoute: ({ row }) => {
                return {
                  name: 'TerminalDetail',
                  params: {
                    id: row.id
                  }
                }
              }
            }
          },
          cpu_load: {
            label: this.$t('TerminalCPULoad'),
            width: '160px',
            align: 'center',
            formatter: (row) => row.stat?.cpu_load ?? '—'
          },
          memory_used: {
            label: this.$t('TerminalMemoryUsage'),
            width: '160px',
            align: 'center',
            formatter: (row) => (row.stat?.memory_used == null ? '—' : `${row.stat.memory_used}%`)
          },
          disk_used: {
            label: this.$t('TerminalDiskUsage'),
            width: '160px',
            align: 'center',
            formatter: (row) => (row.stat?.disk_used == null ? '—' : `${row.stat.disk_used}%`)
          },
          load: {
            filterable: 'custom',
            sortable: false,
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
            align: 'center'
          },
          is_alive: {},
          session_online: {},
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
  },
  created() {
    const storage = new ObjectLocalStorage(
      'tableColumns',
      `${this.$route.name}_${this.tableConfig.url}`
    )
    const columns = storage.get()
    if (Array.isArray(columns) && columns.includes('stat')) {
      storage.set(
        columns.flatMap((column) =>
          column === 'stat' ? ['cpu_load', 'memory_used', 'disk_used'] : column
        )
      )
    }
  },
  methods: {
    handleBulkUpdateDone() {
      this.dialogSettings.visible = false
      this.$refs.ListTable.reloadTable()
    }
  }
}
</script>

<style></style>
