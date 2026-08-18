<template>
  <div>
    <el-alert v-sanitize="helpText" type="info" />
    <IBox>
      <GenericCreateUpdateForm v-bind="$data" />
    </IBox>
    <IBox>
      <ListTable :table-config="reclamationLogConfig" :header-actions="logHeaderActions" />
    </IBox>
  </div>
</template>

<script>
import { IBox, DrawerListTable as ListTable } from '@/components'
import { GenericCreateUpdateForm } from '@/layout/components'
import AddressInput from '@/components/Form/FormFields/AddressInput'
import { toSafeLocalDateStr } from '@/utils/common/time'
import { testNasSetting } from '@/api/settings'

export default {
  name: 'Storage',
  components: {
    IBox,
    GenericCreateUpdateForm,
    ListTable
  },
  data() {
    return {
      url: '/api/v1/settings/setting/?category=storage',
      hasDetailInMsg: false,
      encryptedFields: ['NAS_PASSWORD'],
      helpText: this.$t('StorageHelpText'),
      fields: [
        [
          this.$t('ReclamationSettings'),
          [
            'STORAGE_USAGE_THRESHOLD',
            'STORAGE_RECLAMATION_METHOD'
          ]
        ],
        [
          this.$t('NasSetting'),
          [
            'NAS_ENABLED',
            'NAS_TYPE',
            'NAS_HOST',
            'NAS_PORT',
            'NAS_SHARE_NAME',
            'NAS_USERNAME',
            'NAS_PASSWORD'
          ]
        ]
      ],
      fieldsMeta: {
        STORAGE_USAGE_THRESHOLD: {
          label: this.$t('StorageUsageThreshold')
        },
        STORAGE_RECLAMATION_METHOD: {
          label: this.$t('StorageReclamationMethod'),
          type: 'select',
          options: [
            { label: this.$t('DeleteEarliestDay'), value: 'delete_day' },
            { label: this.$t('ArchiveEarliestDay'), value: 'archive_day' },
            { label: this.$t('DeleteEarliestMonth'), value: 'delete_month' },
            { label: this.$t('ArchiveEarliestMonth'), value: 'archive_month' }
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
            { label: 'Linux(NFS)', value: 'nfs' },
            { label: 'Windows(SMB)', value: 'cifs' }
          ],
          on: {
            // 切换 NAS 类型时清空相关配置，避免残留
            change: ([value], updateForm) => {
              updateForm({
                NAS_HOST: '',
                NAS_PORT: '',
                NAS_SHARE_NAME: '',
                NAS_USERNAME: '',
                NAS_PASSWORD: ''
              })
            }
          }
        },
        NAS_HOST: {
          hidden: (formValue) => !formValue.NAS_ENABLED,
          component: AddressInput,
          label: this.$t('NasHost')
        },
        NAS_PORT: {
          hidden: (formValue) => !formValue.NAS_ENABLED,
          label: this.$t('NasPort')
        },
        NAS_SHARE_NAME: {
          hidden: (formValue) => !formValue.NAS_ENABLED,
          label: this.$t('NasShareName')
        },
        NAS_USERNAME: {
          hidden: (formValue) => !formValue.NAS_ENABLED || formValue.NAS_TYPE === 'nfs',
          label: this.$t('NasUsername')
        },
        NAS_PASSWORD: {
          hidden: (formValue) => !formValue.NAS_ENABLED || formValue.NAS_TYPE === 'nfs',
          label: this.$t('NasPassword')
        }
      },
      cleanFormValue(data) {
        if (!data['NAS_PASSWORD']) {
          delete data['NAS_PASSWORD']
        }
        if (!data['NAS_ENABLED']) {
          data['NAS_PORT'] = 0
        }
        return data
      },
      submitMethod() {
        return 'patch'
      },
      moreButtons: [
        {
          title: this.$t('NasTest'),
          loading: false,
          callback: (value, _form, btn) => {
            btn.loading = true
            testNasSetting(value)
              .then(res => {
                this.$message.success(res['msg'])
              })
              .catch(res => {
                this.$message.error(res['response']['data']['error'])
              })
              .finally(() => {
                btn.loading = false
              })
          }
        }
      ],
      logHeaderActions: {
        title: this.$t('ReclamationLogs'),
        hasCreate: false,
        hasMoreActions: false,
        hasImport: false,
        hasExport: false,
        hasSearch: false
      },
      reclamationLogConfig: {
        url: '/api/v1/audits/storage-reclamation-logs/',
        columns: [
          'date_created', 'method', 'data_start', 'data_end', 'result'
        ],
        columnsShow: {
          default: [
            'date_created', 'method', 'data_start', 'data_end', 'result'
          ]
        },
        columnsMeta: {
          date_created: {
            label: this.$t('ExecutionTime'),
            formatter: (row) => {
              return row.date_created ? toSafeLocalDateStr(row.date_created) : '-'
            }
          },
          method: {
            label: this.$t('StorageReclamationMethod'),
            formatter: (row) => {
              const map = {
                delete_day: this.$t('DeleteEarliestDay'),
                archive_day: this.$t('ArchiveEarliestDay'),
                delete_month: this.$t('DeleteEarliestMonth'),
                archive_month: this.$t('ArchiveEarliestMonth'),
                delete: this.$t('Delete'),
                archive: this.$t('Archive')
              }
              return map[row.method?.value] || row.method?.label || row.method || '-'
            }
          },
          data_start: {
            label: this.$t('DataStart'),
            formatter: (row) => {
              return row.data_start ? toSafeLocalDateStr(row.data_start) : '-'
            }
          },
          data_end: {
            label: this.$t('DataEnd'),
            formatter: (row) => {
              return row.data_end ? toSafeLocalDateStr(row.data_end) : '-'
            }
          },
          result: {
            label: this.$t('Result'),
            formatter: (row) => {
              const map = {
                success: this.$t('Success'),
                fail: this.$t('Fail')
              }
              return map[row.result?.value] || row.result?.label || row.result || '-'
            }
          },
          actions: {
            has: false
          }
        }
      }
    }
  }
}</script>

<style scoped></style>
