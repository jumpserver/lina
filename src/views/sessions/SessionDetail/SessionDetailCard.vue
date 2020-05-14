<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :items="detailItems" />
    </el-col>
    <el-col :span="10">
      <el-card class="box-card primary">
        <div slot="header" class="clearfix">
          <i class="fa fa-info" />
          <span>{{ cardActions }}</span>
        </div>
        <el-table class="el-table" :data="cardActionData" :show-header="false">
          <el-table-column prop="name" />
          <el-table-column prop="button" align="right">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="handleButtonAction(scope.$index, scope.row)">
                {{ scope.row.button }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard/index'

export default {
  name: 'SessionDetailCard',
  components: {
    DetailCard
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
    cardActions() {
      return this.$t('sessions.quickModify')
    },
    cardActionData() {
      return [
        {
          name: this.$t('sessions.replaySession'),
          button: this.$t('sessions.go'),
          value: 'replay'
        },
        {
          name: this.$t('sessions.downloadReplay'),
          button: this.$t('sessions.download'),
          value: 'download'
        }
      ]
    }
  },
  methods: {
    handleButtonAction: function(index, row) {
      switch (row.value) {
        case 'replay':
          this.openReplaySession(this.sessionData.id)
          break
        case 'download':
          this.openReplayDownload(this.sessionData.id)
          break
        default:
          console.log('No Match button action: ' + row.value)
      }
    },

    openReplaySession: function(id) {
      const replayUrl = '/luna/replay/' + id
      window.open(replayUrl)
    },
    openReplayDownload: function(id) {
      const downloadUrl = '/terminal/session/00000000-0000-0000-0000-000000000000/replay/download/'
        .replace('00000000-0000-0000-0000-000000000000', id)
      window.open(downloadUrl)
    }
  }
}
</script>

<style scoped>

</style>
