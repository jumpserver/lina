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
    return {
      url: '/api/v1/terminal/sessions/?is_finished=1',
      extraActions: [
        {
          name: 'replay',
          title: this.$t('sessions.replay'),
          type: 'warning',
          can: (row, cellValue) => {
            return row.has_replay
          },
          callback: function({ cellValue, tableData }) {
            // 跳转到luna页面
            const replayUrl = '/luna/replay/' + cellValue
            window.open(replayUrl)
          }
        },
        {
          name: 'download',
          title: this.$t('sessions.download'),
          type: 'primary',
          can: (row, cellValue) => {
            return row.has_replay
          },
          callback: function({ cellValue, tableData }) {
            // 跳转下载页面
            const downloadUrl = '/terminal/session/00000000-0000-0000-0000-000000000000/replay/download/'
              .replace('00000000-0000-0000-0000-000000000000', cellValue)
            window.open(downloadUrl)
          }
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
