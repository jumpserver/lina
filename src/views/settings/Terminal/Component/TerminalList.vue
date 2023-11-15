<template>
  <div>
    <ListTable :header-actions="headerActions" :table-config="tableConfig" />
    <Dialog
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      :title="$tc('sessions.terminalUpdateStorage')"
      :visible.sync="dialogSettings.visible"
    >
      <GenericCreateUpdateForm v-bind="dialogSettings.iFormSetting" />
    </Dialog>
  </div>
</template>

<script>
import ListTable from '@/components/Table/ListTable'
import { GenericCreateUpdateForm } from '@/layout/components'
import Dialog from '@/components/Dialog'
import Select2 from '@/components/Form/FormFields/Select2'

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
                  url: `/api/v1/terminal/replay-storages/?type_not=sftp`
                },
                multiple: false
              }
            }
          },
          submitMethod: () => 'post',
          cleanFormValue: (value) => {
            const formValue = []
            let object = {}
            for (const row of this.dialogSettings.selectedRows) {
              object = Object.assign({}, value, { id: row.id })
              formValue.push(object)
            }
            return formValue
          },
          onSubmit: (validValues) => {
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
