<template>
  <GenericDetailPage :submenu="submenu" :active-menu="activeSubMenu" :title="title">
    <div slot="detail">
      <el-row :gutter="20">
        <el-col :span="14">
          <DetailCard :title="cardTitle" :items="detailItems" />
        </el-col>
      </el-row>
    </div>
  </GenericDetailPage>

</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import DetailCard from '@/components/DetailCard/index'
import { getTerminalDetail } from '@/api/sessions'

export default {
  name: 'TerminalDetail',
  components: {
    GenericDetailPage,
    DetailCard
  },
  data() {
    return {
      terminalData: {},
      activeSubMenu: 'detail',
      submenu: [
        {
          title: this.$t('sessions.terminalDetail'),
          name: 'detail'
        }
      ]
    }
  },
  computed: {
    title() {
      return this.$t('sessions.terminalDetail')
    },
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
        {
          key: this.$t('sessions.sshPort'),
          value: this.terminalData.ssh_port
        },
        {
          key: this.$t('sessions.httpPort'),
          value: this.terminalData.http_port
        },
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
  },
  mounted() {
    getTerminalDetail(this.$route.params.id).then(data => {
      this.terminalData = data
    })
  }
}
</script>

<style scoped>

</style>
