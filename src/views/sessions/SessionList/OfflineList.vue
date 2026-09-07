<template>
  <BaseList
    :extra-actions="extraActions"
    :url="url"
    :columns-meta="columnsMeta"
    :columns-exclude="columnsExclude"
    :header-actions="headerActions"
  />
</template>

<script>
import BaseList from './BaseList'
import { addBasePath, download } from '@/utils/common/index'

const DOWNLOAD_INTERVAL = 300

export default {
  name: 'OfflineList',
  components: {
    BaseList
  },
  props: {
    url: {
      type: String,
      default: () => '/api/v1/terminal/sessions/?is_finished=1'
    }
  },
  data() {
    const vm = this
    return {
      headerActions: {
        hasLeftActions: this.$hasPerm('terminal.download_sessionreplay'),
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasMoreActions: false,
        extraActions: [
          {
            name: 'downloadSelectedReplays',
            title: this.$t('DownloadReplay'),
            type: 'primary',
            icon: 'download',
            can: ({ selectedRows }) => selectedRows.length > 0,
            callback: ({ selectedRows }) => vm.downloadSelectedReplays(selectedRows)
          }
        ]
      },
      extraActions: [
        {
          name: 'replay',
          title: this.$t('Replay'),
          icon: 'fa-solid fa-play',
          type: 'warning',
          // TODO 当前版本 magnus 代理的 mongodb 协议的 session 不支持 replay
          can: ({ row }) =>
            vm.hasPerms(row, 'view') &&
            !(row.protocol === 'mongodb' && row.terminal.type === 'magnus'),
          callback: function ({ row, tableData }) {
            // 跳转到luna页面
            const replayUrl = '/luna/replay/' + row.id
            window.open(addBasePath(replayUrl))
          }
        },
        {
          name: 'download',
          title: this.$t('Download'),
          type: 'primary',
          can: ({ row }) => vm.canDownloadReplay(row),
          callback: function ({ row, tableData }) {
            // 跳转下载页面
            download(`/api/v1/terminal/sessions/${row.id}/replay/download/`)
          }
        }
      ],
      columnsExclude: ['has_command'],
      columnsMeta: {
        command_amount: {
          label: this.$t('CommandsTotal')
        }
      }
    }
  },
  methods: {
    canDownloadReplay(row) {
      const isUnsupportedMongoDB = row.protocol === 'mongodb' && row.terminal?.type === 'magnus'
      return this.hasPerms(row, 'download') && !isUnsupportedMongoDB
    },
    async downloadSelectedReplays(selectedRows) {
      const downloadableRows = selectedRows.filter((row) => this.canDownloadReplay(row))
      const unavailableCount = selectedRows.length - downloadableRows.length

      if (downloadableRows.length === 0) {
        this.$message.warning(this.$t('DownloadReplayNoneAvailable'))
        return
      }

      if (unavailableCount > 0) {
        try {
          await this.$confirm(
            this.$t('DownloadReplayPartialConfirm', {
              selected: selectedRows.length,
              available: downloadableRows.length,
              unavailable: unavailableCount
            }),
            this.$t('Confirm'),
            { type: 'warning' }
          )
        } catch {
          return
        }
      }

      for (const [index, row] of downloadableRows.entries()) {
        download(`/api/v1/terminal/sessions/${row.id}/replay/download/`)
        if (index < downloadableRows.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, DOWNLOAD_INTERVAL))
        }
      }
    },
    hasPerms(row, type) {
      return row['can_replay'] && this.$hasPerm(`terminal.${type}_sessionreplay`)
    }
  }
}
</script>
