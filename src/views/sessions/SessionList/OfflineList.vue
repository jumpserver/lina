<template>
  <BaseList :url="url" :extra-actions="extraActions" />
</template>

<script>
import BaseList from './BaseList'
export default {
  name: 'OfflineList',
  components: {
    BaseList
  },
  data() {
    const vm = this
    return {
      url: '/api/v1/terminal/sessions/?is_finished=1',
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
            const downloadUrl = `/api/v1/terminal/sessions/${row.id}/replay/download/`
            const a = document.createElement('a')
            a.href = downloadUrl
            a.click()
            window.URL.revokeObjectURL(downloadUrl)
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
