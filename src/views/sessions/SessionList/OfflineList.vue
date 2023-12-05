<template>
  <BaseList :url="url" :extra-actions="extraActions" />
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
          title: this.$t('sessions.replay'),
          type: 'warning',
          can: ({ row }) => vm.hasPerms(row, 'view'),
          callback: function({ row, tableData }) {
            // 跳转到luna页面
            const replayUrl = '/luna/replay/' + row.id
            window.open(replayUrl)
          }
        },
        {
          name: 'download',
          title: this.$t('sessions.download'),
          type: 'primary',
          can: ({ row }) => vm.hasPerms(row, 'download'),
          callback: function({ row, tableData }) {
            // 跳转下载页面
            download(`/api/v1/terminal/sessions/${row.id}/replay/download/`)
          }
        }
      ]
    }
  },
  methods: {
    hasPerms(row, type) {
      return row['can_replay'] && this.$hasPerm(`terminal.${type}_sessionreplay`)
    }
  }
}
</script>

<style scoped>

</style>
