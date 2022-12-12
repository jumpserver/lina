<template>
  <div>
    <BaseList
      :url="url"
      :extra-actions="extraActions"
      :header-config="headerConfig"
    />
  </div>
</template>

<script>
import BaseList from './BaseList'
import { createSourceIdCache } from '@/api/common'
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
            vm.download(row.id)
          }
        }
      ],
      headerConfig: {
        hasCreate: false,
        hasBulkDelete: false,
        hasLeftActions: true,
        extraMoreActions: [
          {
            name: 'actionDownloadSelected',
            title: this.$t('common.downloadSelected'),
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 &&
                !vm.currentOrgIsRoot &&
                vm.$hasPerm('terminal.download_sessionreplay') &&
                selectedRows.filter((i) => {
                  return i['can_replay']
                }).length > 0
            },
            callback: async({ selectedRows }) => {
              const ids = selectedRows.map(v => { return v.id })
              const resp = await createSourceIdCache(ids)
              vm.download(resp.spm)
            }
          }
        ]
      }
    }
  },
  methods: {
    download(itemId) {
      const downloadUrl = `/api/v1/terminal/sessions/${itemId}/replay/download/`
      const a = document.createElement('a')
      a.href = downloadUrl
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
    },
    hasPerms(row, type) {
      return row['can_replay'] && this.$hasPerm(`terminal.${type}_sessionreplay`)
    }
  }
}
</script>

<style scoped>

</style>
