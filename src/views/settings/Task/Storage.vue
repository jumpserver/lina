<template>
  <div>
    <el-alert v-sanitize="helpText" type="info" />
    <IBox>
      <GenericCreateUpdateForm v-bind="$data" />
    </IBox>
    <IBox>
      <el-tabs v-model="activeTab">
        <el-tab-pane :label="$t('ReclamationLogs')" name="reclamation">
          <ListTable :key="activeTab" :table-config="reclamationLogConfig" :header-actions="logHeaderActions" />
        </el-tab-pane>
        <el-tab-pane :label="$t('ArchiveLogs')" name="archive">
          <ListTable :key="activeTab" :table-config="archiveLogConfig" :header-actions="logHeaderActions" />
        </el-tab-pane>
      </el-tabs>
    </IBox>
  </div>
</template>

<script>
import { IBox, DrawerListTable as ListTable } from '@/components'
import { GenericCreateUpdateForm } from '@/layout/components'
import { toSafeLocalDateStr } from '@/utils/common/time'
import { testNasSetting, archiveStorage } from '@/api/settings'

export default {
  name: 'Storage',
  components: {
    IBox,
    GenericCreateUpdateForm,
    ListTable
  },
  data() {
    const vm = this
    return {
      activeTab: 'reclamation',
      url: '/api/v1/settings/setting/?category=storage',
      hasDetailInMsg: false,
      encryptedFields: ['NAS_PASSWORD'],
      helpText: this.$t('StorageHelpText'),
      fields: [
        [
          this.$t('Basic'),
          [
            'FTP_FILE_MAX_STORE',
            'STORAGE_USAGE_THRESHOLD',
            'STORAGE_RECLAMATION_TARGETS'
          ]
        ],
        [
          this.$t('NasSetting'),
          [
            'NAS_ENABLED',
            'NAS_TYPE',
            'NAS_HOST',
            'NAS_SHARE_NAME',
            'NAS_MOUNT_PATH',
            'NAS_USERNAME',
            'NAS_PASSWORD',
            'ARCHIVE_DATE'
          ]
        ]
      ],
      fieldsMeta: {
        FTP_FILE_MAX_STORE: {
          label: this.$t('FTPFileMaxStore')
        },
        STORAGE_USAGE_THRESHOLD: {
          label: this.$t('StorageUsageThreshold')
        },
        STORAGE_RECLAMATION_TARGETS: {
          label: this.$t('StorageReclamationTargets'),
          type: 'checkbox-group',
          component: null,
          options: [
            { label: this.$t('SessionReplay'), value: 'session_replay' },
            { label: this.$t('FileTransfer'), value: 'file_transfer' }
          ]
        },
        NAS_ENABLED: {
          label: this.$t('NasEnabled')
        },
        NAS_TYPE: {
          hidden: (formValue) => !formValue.NAS_ENABLED,
          label: this.$t('NasType'),
          type: 'radio-group',
          options: [
            { label: 'Unix(NFS)', value: 'nfs' },
            { label: 'Windows(CIFS)', value: 'cifs' }
          ]
        },
        NAS_HOST: {
          hidden: (formValue) => !formValue.NAS_ENABLED,
          label: this.$t('NasHost')
        },
        NAS_SHARE_NAME: {
          hidden: (formValue) => !formValue.NAS_ENABLED,
          label: this.$t('NasShareName')
        },
        NAS_MOUNT_PATH: {
          hidden: (formValue) => !formValue.NAS_ENABLED,
          label: this.$t('NasMountPath')
        },
        NAS_USERNAME: {
          hidden: (formValue) => !formValue.NAS_ENABLED,
          label: this.$t('NasUsername')
        },
        NAS_PASSWORD: {
          hidden: (formValue) => !formValue.NAS_ENABLED,
          label: this.$t('NasPassword')
        },
        ARCHIVE_DATE: {
          hidden: (formValue) => !formValue.NAS_ENABLED,
          label: this.$t('ArchiveDate'),
          type: 'date-picker',
          el: {
            type: 'date',
            valueFormat: 'yyyy-MM-dd'
          }
        }
      },
      cleanFormValue(data) {
        if (!data['NAS_PASSWORD']) {
          delete data['NAS_PASSWORD']
        }
        delete data['ARCHIVE_DATE']
        return data
      },
      submitMethod() {
        return 'patch'
      },
      moreButtons: [
        {
          title: this.$t('NasTest'),
          loading: false,
          callback: function(value, form, btn) {
            btn.loading = true
            testNasSetting(value)
              .then(res => {
                vm.$message.success(res['msg'])
              })
              .catch(res => {
                vm.$message.error(res['response']['data']['error'])
              })
              .finally(() => {
                btn.loading = false
              })
          }
        },
        {
          title: this.$t('Archive'),
          loading: false,
          callback: function(value, form, btn) {
            if (!value['ARCHIVE_DATE']) {
              vm.$message.warning(vm.$t('PleaseSelectArchiveDate'))
              return
            }
            btn.loading = true
            archiveStorage({ date: value['ARCHIVE_DATE'] })
              .then(res => {
                vm.$message.success(res['msg'])
              })
              .catch(res => {
                vm.$message.error(res['response']['data']['error'])
              })
              .finally(() => {
                btn.loading = false
              })
          }
        }
      ],
      logHeaderActions: {
        hasCreate: false,
        hasMoreActions: false,
        hasImport: false,
        hasExport: false,
        hasSearch: false
      },
      reclamationLogConfig: {
        url: '/api/v1/audits/storage-reclamation-logs/',
        columns: [
          'session_id', 'target_type', 'file_path', 'file_size', 'date_created'
        ],
        columnsShow: {
          default: [
            'session_id', 'target_type', 'file_path', 'file_size', 'date_created'
          ]
        },
        columnsMeta: {
          target_type: {
            label: this.$t('TargetType'),
            formatter: (row) => {
              const map = {
                session_replay: this.$t('SessionReplay'),
                file_transfer: this.$t('FileTransfer')
              }
              return map[row.target_type] || row.target_type
            }
          },
          file_path: {
            label: this.$t('FilePath')
          },
          file_size: {
            label: this.$t('FileSize'),
            formatter: (row) => {
              return vm.formatFileSize(row.file_size)
            }
          },
          date_created: {
            label: this.$t('DateCreated'),
            formatter: (row) => {
              if (row.date_created) {
                return toSafeLocalDateStr(row.date_created)
              }
              return '-'
            }
          },
          actions: {
            has: false
          }
        }
      },
      archiveLogConfig: {
        url: '/api/v1/audits/storage-archive-logs/',
        columns: [
          'session_id', 'file_path', 'file_size', 'date_created'
        ],
        columnsShow: {
          default: [
            'session_id', 'file_path', 'file_size', 'date_created'
          ]
        },
        columnsMeta: {
          file_path: {
            label: this.$t('FilePath')
          },
          file_size: {
            label: this.$t('FileSize'),
            formatter: (row) => {
              return vm.formatFileSize(row.file_size)
            }
          },
          date_created: {
            label: this.$t('DateCreated'),
            formatter: (row) => {
              if (row.date_created) {
                return toSafeLocalDateStr(row.date_created)
              }
              return '-'
            }
          },
          actions: {
            has: false
          }
        }
      }
    }
  },
  methods: {
    formatFileSize(bytes) {
      if (bytes == null) return '-'
      if (bytes === 0) return '0 B'
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      const k = 1024
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i]
    }
  }
}
</script>

<style scoped></style>
