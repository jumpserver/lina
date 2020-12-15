<template>
  <div>
    <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
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
import { GenericListPage, GenericCreateUpdateForm } from '@/layout/components'
import Dialog from '@/components/Dialog'
import Select2 from '@/components/Select2'
import { BooleanFormatter } from '@/components/ListTable/formatters'
export default {
  components: {
    GenericListPage,
    Dialog,
    GenericCreateUpdateForm
  },
  data() {
    return {
      dialogSettings: {
        selectedRows: [],
        visible: false,
        iFormSetting: {
          url: '/api/v1/terminal/terminals/',
          fields: [
            ['', ['command_storage', 'replay_storage']]
          ],
          fieldsMeta: {
            command_storage: {
              component: Select2,
              rules: [{ required: true }],
              el: {
                ajax: {
                  url: `/api/v1/terminal/command-storages/`
                },
                multiple: false
              }
            },
            replay_storage: {
              component: Select2,
              rules: [{ required: true }],
              el: {
                ajax: {
                  url: `/api/v1/terminal/replay-storages/`
                },
                multiple: false
              }
            }
          },
          getMethod: () => 'post',
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
        columns: ['name', 'remote_addr', 'session_online',
          'state.session_active_count',
          'state.system_cpu_load_1',
          'state.system_disk_used_percent',
          'state.system_memory_used_percent',
          'is_active',
          'is_alive',
          'actions'],
        columnsMeta: {
          name: {
            sortable: 'custom'
          },
          'state.session_active_count': {
            label: this.$t('sessions.sessionActiveCount'),
            width: '160px'
          },
          'state.system_cpu_load_1': {
            label: this.$t('sessions.systemCpuLoad'),
            width: '160px'
          },
          'state.system_disk_used_percent': {
            label: this.$t('sessions.systemDiskUsedPercent'),
            width: '160px'
          },
          'state.system_memory_used_percent': {
            label: this.$t('sessions.systemMemoryUsedPercent'),
            width: '160px'
          },
          remote_addr: {
            sortable: 'custom'
          },
          is_active: {
            label: this.$t('sessions.active'),
            formatter: BooleanFormatter,
            width: '80px',
            align: 'center'
          },
          is_alive: {
            label: this.$t('sessions.alive')
          },
          session_online: {
            label: this.$t('sessions.session'),
            width: '80px'
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
        extraActions: [
          {
            name: 'StorageConfiguration',
            title: this.$t('sessions.StorageConfiguration'),
            type: 'primary',
            has: true,
            can: true,
            callback: this.handleStorageConfiguration
          }
        ],
        extraMoreActions: [
          {
            name: 'updateSelected',
            title: this.$t('common.updateSelected'),
            can: ({ selectedRows }) => selectedRows.length > 0,
            callback: function({ selectedRows, reloadTable }) {
              this.dialogSettings.selectedRows = selectedRows
              this.dialogSettings.visible = true
            }.bind(this)
          }
        ]
      }
    }
  },
  methods: {
    handleStorageConfiguration() {
      this.$router.push('/terminal/storages')
    }
  }
}
</script>

<style>
</style>
