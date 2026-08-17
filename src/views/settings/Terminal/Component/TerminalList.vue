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
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'session_online', 'stat', 'load', 'actions']
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
          stat: {
            formatter: (row) => {
              if (!row?.stat) {
                return ''
              }
              const stat = row.stat
              return `${stat['cpu_load']} / ${stat['memory_used']}% / ${stat['disk_used']}%`
            },
            helpTip: 'CPU / Memory / Disk'
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
            },
            helpTip: 'CPU / Memory / Disk'
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
  methods: {
    handleBulkUpdateDone() {
      this.dialogSettings.visible = false
      this.$refs.ListTable.reloadTable()
    }
  }
}
</script>

<style></style>
