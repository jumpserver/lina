<template>
  <component
    :is="embedded ? 'GenericListTable' : 'GenericListPage'"
    :header-actions="headerActions"
    :table-config="tableConfig"
  />
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import GenericListTable from '@/layout/components/GenericListTable'
import { ChoicesFormatter } from '@/components/Table/TableFormatters'
import OverflowTooltipFormatter from '@/components/Table/TableFormatters/OverflowTooltipFormatter.vue'
import { download } from '@/utils/common/index'
import store from '@/store'

export default {
  components: {
    GenericListPage,
    GenericListTable
  },
  props: {
    embedded: { type: Boolean, default: false },
    category: { type: String, default: '' },
    orgId: { type: String, default: '' }
  },
  data() {
    const query = new URLSearchParams()
    if (this.category) query.set('category', this.category)
    if (this.orgId) query.set('oid', this.orgId)
    const orgQuery = this.orgId ? `?oid=${encodeURIComponent(this.orgId)}` : ''
    return {
      tableConfig: {
        columnsShow: {
          default: [
            'user',
            'asset',
            'account',
            'operate',
            'login_from',
            'filename',
            'date_start',
            'is_success',
            'actions'
          ],
          min: ['user', 'asset', 'filename']
        },
        url: `/api/v1/audits/ftp-logs/${query.size ? `?${query}` : ''}`,
        columnsMeta: {
          login_from: { label: this.$t('Source'), width: '150px', formatter: ChoicesFormatter },
          filename: {
            width: '200px',
            formatter: OverflowTooltipFormatter
          },
          is_success: { width: '100px' },
          actions: {
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'download',
                  title: this.$t('Download'),
                  type: 'primary',
                  can: ({ row }) => {
                    return row.has_file
                  },
                  tip: ({ row }) => {
                    const ftpFileMaxStore = store.getters.publicSettings['FTP_FILE_MAX_STORE']

                    const downloadTip = this.$t('Download')
                    const fileNotStoredTip = this.$t('FTPFileNotStored')
                    const storageNotEnabledTip = this.$t('FTPStorageNotEnabled')
                    const unknownStorageStateTip = this.$t('FTPUnknownStorageState')

                    if (row.has_file) {
                      return downloadTip
                    }

                    if (ftpFileMaxStore === 0) {
                      return storageNotEnabledTip
                    } else if (ftpFileMaxStore > 0) {
                      return fileNotStoredTip
                    } else {
                      return unknownStorageStateTip
                    }
                  },
                  callback: function ({ row }) {
                    // 跳转下载页面
                    download(`/api/v1/audits/ftp-logs/${row.id}/file/download/${orgQuery}`)
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasReportExport: true,
        hasDatePicker: true,
        searchConfig: {
          getUrlQuery: true
        }
      }
    }
  }
}
</script>

<style></style>
