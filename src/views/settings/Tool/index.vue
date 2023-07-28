<template>
  <TabPage :submenu="submenu" :active-menu.sync="activeMenu">
    <div>
      <el-alert v-if="currentTime" :closable="false" type="info">
        {{ `${this.$t('setting.ServerTime')}: ${currentTime}` }}
      </el-alert>
      <keep-alive>
        <component :is="activeMenu" />
      </keep-alive>
    </div>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage'
import Ping from './Ping'
import Telnet from './Telnet'
import Nmap from './Nmap'

export default {
  components: {
    TabPage,
    Ping,
    Telnet,
    Nmap
  },
  data() {
    return {
      timer: null,
      currentTime: '',
      loading: true,
      activeMenu: 'Ping',
      submenu: [
        {
          title: 'Ping',
          name: 'Ping'
        },
        {
          title: 'Telnet',
          name: 'Telnet'
        },
        {
          title: 'Nmap',
          name: 'Nmap'
        }
      ]
    }
  },
  computed: {
    componentData() {
      return {}
    }
  },
  created() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    this.$axios.get('/api/v1/settings/server-info/').then(info => {
      const remoteTime = new Date(info.CURRENT_TIME)
      this.timer = setInterval(() => {
        remoteTime.setSeconds(remoteTime.getSeconds() + 1)
        this.currentTime = this.$moment(remoteTime).format('YYYY-MM-DD HH:mm:ss')
      }, 1000)
    })
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style scoped>

</style>
