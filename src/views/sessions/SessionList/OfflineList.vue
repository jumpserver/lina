<template>
  <BaseList :extra-actions="extraActions" :url="url" :columns-meta="columnsMeta" :columns-exclude="columnsExclude" />
</template>

<script>
import BaseList from './BaseList'
import { download } from '@/utils/common'

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
      extraActions: [
        {
          name: 'replay',
          title: this.$t('Replay'),
          type: 'warning',
          // TODO 当前版本 magnus 代理的 mongodb 协议的 session 不支持 replay
          can: ({ row }) => vm.hasPerms(row, 'view') && !(row.protocol === 'mongodb' && row.terminal.type === 'magnus'),
          callback: function({ row, tableData }) {
            // 跳转到luna页面
            const replayUrl = '/luna/replay/' + row.id
            window.open(replayUrl)
          }
        },
        {
          name: 'download',
          title: this.$t('Download'),
          type: 'primary',
          can: ({ row }) => vm.hasPerms(row, 'download') && !(row.protocol === 'mongodb' && row.terminal.type === 'magnus'),
          callback: function({ row, tableData }) {
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
    hasPerms(row, type) {
      return row['can_replay'] && this.$hasPerm(`terminal.${type}_sessionreplay`)
    }
  }
}
</script>
