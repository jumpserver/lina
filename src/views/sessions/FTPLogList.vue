<template>
  <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { download } from '@/utils/common'
import store from '@/store'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        columnsShow: {
          default: [
            'id', 'user', 'asset', 'account', 'operate',
            'filename', 'date_start', 'is_success', 'actions'
          ]
        },
        url: '/api/v1/audits/ftp-logs/',
        columnsMeta: {
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
                  callback: function({ row }) {
                    // 跳转下载页面
                    download(`/api/v1/audits/ftp-logs/${row.id}/file/download/`)
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
        hasDatePicker: true
      }
    }
  }
}
</script>

<style>

</style>
