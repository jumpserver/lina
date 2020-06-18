<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :items="detailItems" />
    </el-col>
    <el-col :span="10">
      <QuickActions type="primary" :actions="quickActions" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard/index'
import QuickActions from '@/components/QuickActions'
export default {
  name: 'SessionDetailCard',
  components: {
    DetailCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      sessionData: this.object
    }
  },
  computed: {
    detailItems() {
      return [
        {
          key: this.$t('sessions.user'),
          value: this.sessionData.user
        },
        {
          key: this.$t('sessions.asset'),
          value: this.sessionData.asset
        },
        {
          key: this.$t('sessions.systemUser'),
          value: this.sessionData.system_user
        },
        {
          key: this.$t('sessions.protocol'),
          value: this.sessionData.protocol
        },
        {
          key: this.$t('sessions.loginFrom'),
          value: this.sessionData.login_from
        },
        {
          key: this.$t('sessions.remoteAddr'),
          value: this.sessionData.remote_addr
        },
        {
          key: this.$t('sessions.dateStart'),
          value: this.sessionData.date_start
        },
        {
          key: this.$t('sessions.dateEnd'),
          value: this.sessionData.date_end
        }
      ]
    },
    quickActions() {
      const vm = this
      return [
        {
          title: this.$t('sessions.replaySession'),
          attrs: {
            type: 'primary',
            label: this.$t('sessions.go')
          },
          callbacks: {
            click: function() {
              vm.openReplaySession(vm.sessionData.id)
            }

          }
        },
        {
          title: this.$t('sessions.downloadReplay'),
          attrs: {
            type: 'primary',
            label: this.$t('sessions.download')
          },
          callbacks: {
            click: function() {
              vm.openReplayDownload(vm.sessionData.id)
            }
          }
        }
      ]
    }
  },
  methods: {
    openReplaySession: function(id) {
      const replayUrl = '/luna/replay/' + id
      window.open(replayUrl)
    },
    openReplayDownload: function(id) {
      const downloadUrl = '/api/v1/terminal/session/00000000-0000-0000-0000-000000000000/replay/download/'
        .replace('00000000-0000-0000-0000-000000000000', id)
      window.open(downloadUrl)
    }
  }
}
</script>

<style scoped>

</style>
