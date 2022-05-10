<template>
  <div>
    <ListTable :table-config="tableConfig" :header-actions="headerActions" />
    <Dialog
      :visible.sync="dialogSettings.visible"
      :destroy-on-close="true"
      :show-cancel="false"
      :title="$t('sessions.terminalUpdateStorage')"
      :show-confirm="false"
    >
      <GenericCreateUpdateForm v-bind="dialogSettings.iFormSetting" />
    </Dialog>
  </div>
</template>

<script>
import ListTable from '@/components/ListTable'
import { GenericCreateUpdateForm } from '@/layout/components'
import Dialog from '@/components/Dialog'
import Select2 from '@/components/FormFields/Select2'

const numTotFixed = (row, type) => {
  const cur = row.stat?.[type] || ''
  if (cur instanceof Number && !Number.isInteger(cur)) {
    return cur.toFixed(1)
  }
  return cur
}
export default {
  components: {
    ListTable,
    Dialog,
    GenericCreateUpdateForm
  },
  data() {
    const vm = this
    return {
      dialogSettings: {
        selectedRows: [],
        visible: false,
        iFormSetting: {
          url: '/api/v1/terminal/terminals/',
          getUrl: () => '/api/v1/terminal/terminals/',
          fields: [
            ['', ['command_storage', 'replay_storage']]
          ],
          fieldsMeta: {
            command_storage: {
              label: this.$t('sessions.commandStorage'),
              component: Select2,
              el: {
                ajax: {
                  url: `/api/v1/terminal/command-storages/`
                },
                multiple: false
              }
            },
            replay_storage: {
              label: this.$t('sessions.replayStorage'),
              component: Select2,
              el: {
                ajax: {
                  url: `/api/v1/terminal/replay-storages/`
                },
                multiple: false
              }
            }
          },
          submitMethod: () => 'post',
          cleanFormValue: function(value) {
            const formValue = []
            let object = {}
            for (const row of this.dialogSettings.selectedRows) {
              object = Object.assign({}, value, { id: row.id })
              formValue.push(object)
            }
            return formValue
          }.bind(this),
          onSubmit: function(validValues) {
            const url = '/api/v1/terminal/terminals/'
            const msg = this.$t('common.updateSuccessMsg')
            validValues = Object.values(validValues)
            this.$axios.patch(url, validValues).then((res) => {
              this.$message.success(msg)
              this.dialogSettings.visible = false
            }).catch(error => {
              this.$emit('submitError', error)
              const response = error.response
              const data = response.data
              if (response.status === 400) {
                for (const key of Object.keys(data)) {
                  let value = data[key]
                  if (value instanceof Array) {
                    value = value.join(';')
                  }
                  this.$refs.form.setFieldError(key, value)
                }
              }
            })
          }.bind(this),
          hasSaveContinue: false
        }
      },
      tableConfig: {
        url: '/api/v1/terminal/terminals/',
        permissions: {
          app: 'terminal',
          resource: 'terminal'
        },
        columns: [
          'name', 'remote_addr', 'session_online',
          'stat.cpu_load',
          'stat.disk_used', 'stat.memory_used',
          'status',
          'is_active', 'is_alive', 'actions'
        ],
        columnsMeta: {
          name: {
            sortable: 'custom',
            formatterArgs: {
              route: 'TerminalDetail'
            }
          },
          'stat.cpu_load': {
            label: this.$t('sessions.systemCpuLoad'),
            width: '120px',
            formatter: (row) => (numTotFixed(row, 'cpu_load'))
          },
          'stat.disk_used': {
            label: this.$t('sessions.systemDiskUsedPercent'),
            width: '120px',
            formatter: (row) => (numTotFixed(row, 'disk_used'))
          },
          'stat.memory_used': {
            label: this.$t('sessions.systemMemoryUsedPercent'),
            width: '120px',
            formatter: (row) => (numTotFixed(row, 'memory_used'))
          },
          status: {
            label: this.$t('xpack.LoadStatus'),
            width: '120px',
            // formatter: DisplayFormatter,
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
        hasBulkDelete: false,
        hasUpload: false,
        hasExport: false,
        hasImport: false,
        hasUpdate: false,
        extraActions: [],
        extraMoreActions: [
          {
            name: 'actionUpdateSelected',
            title: this.$t('common.updateSelected'),
            can: ({ selectedRows }) => selectedRows.length > 0 && vm.$hasPerm('terminal.change_terminal'),
            callback: function({ selectedRows, reloadTable }) {
              this.dialogSettings.selectedRows = selectedRows
              this.dialogSettings.visible = true
            }.bind(this)
          }
        ]
      }
    }
  }
}
</script>

<style>
</style>
