<template>
  <ListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import ListTable from '@/components/Table/ListTable'
import { download } from '@/utils/common'

export default {
  name: 'SessionFTPLogs',
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        hasSelection: false,
        url: `/api/v1/audits/ftp-logs/?session=${this.$route.params.id}`,
        columnsShow: {
          default: [
            'id', 'user', 'remote_addr', 'asset', 'account', 'operate',
            'filename', 'date_start', 'is_success', 'actions'
          ]
        },
        columnsMeta: {
          remote_addr: {
            width: '140px'
          },
          operate: {
            width: '100px'
          },
          is_success: {
            width: '100px'
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
                  title: this.$t('Download'),
                  type: 'primary',
                  can: ({ row }) => {
                    return row.has_file
                  },
                  tip: ({ row }) => {
                    return row.has_file ? this.$t('Download') : this.$t('.DownloadFTPFileTip')
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
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: false,
        hasSearch: false,
        hasRightActions: false
      }
    }
  },
  async mounted() {
    const drawActionMeta = await this.$store.dispatch('common/getDrawerActionMeta')

    if (drawActionMeta && drawActionMeta.id) {
      this.tableConfig.url = `/api/v1/audits/ftp-logs/?session=${drawActionMeta.id}`
    }
  }
}
</script>
