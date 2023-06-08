<template>
  <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import GenericListPage from '@/layout/components/GenericListPage'
import { download } from '@/utils/common'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        columnsShow: {
          default: [
            'id', 'user', 'remote_addr', 'asset', 'account', 'operate',
            'filename', 'date_start', 'is_success', 'actions'
          ]
        },
        url: '/api/v1/audits/ftp-logs/',
        columnsMeta: {
          remote_addr: {
            width: '140px'
          },
          operate: {
            width: '100px'
          },
          is_success: {
            width: '80px'
          },
          actions: {
            width: '82px',
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'download',
                  title: this.$t('sessions.download'),
                  type: 'primary',
                  can: ({ row }) => { return row.has_file },
                  tip: ({ row }) => {
                    return row.has_file ? this.$t('sessions.download') : this.$t('sessions.DownloadFTPFileTip')
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
