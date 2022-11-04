<template>
  <GenericDetailPage :object.sync="terminalData" v-bind="config">
    <div>
      <el-row :gutter="20">
        <el-col :md="14" :sm="24">
          <DetailCard :title="cardTitle" :items="detailItems" />
        </el-col>
      </el-row>
    </div>
  </GenericDetailPage>

</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import DetailCard from '@/components/DetailCard/index'

export default {
  name: 'TerminalDetail',
  components: {
    GenericDetailPage,
    DetailCard
  },
  data() {
    return {
      terminalData: {},
      loading: true,
      config: {
        submenu: [
          {
            title: this.$t('sessions.terminalDetail'),
            name: 'detail'
          }
        ],
        hasDelete: false,
        actions: {
          canUpdate: this.$hasPerm('terminal.change_terminal'),
          hasDelete: false,
          canDelete: false,
          detailApiUrl: `/api/v1/terminal/terminals/${this.$route.params.id}/`
        }
      }
    }
  },
  computed: {
    cardTitle() {
      return this.terminalData.name
    },
    detailItems() {
      return [
        {
          key: this.$t('sessions.name'),
          value: this.terminalData.name
        },
        {
          key: this.$t('sessions.remoteAddr'),
          value: this.terminalData.remote_addr
        },
        // {
        //   key: this.$t('sessions.sshPort'),
        //   value: this.terminalData.ssh_port
        // },
        // {
        //   key: this.$t('sessions.httpPort'),
        //   value: this.terminalData.http_port
        // },
        {
          key: this.$t('sessions.dateCreated'),
          value: this.terminalData.date_created
        },
        {
          key: this.$t('sessions.comment'),
          value: this.terminalData.comment
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
