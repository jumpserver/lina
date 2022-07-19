<template>
  <component :is="systemUserProtocolComponent" :title="iTitle" />
</template>

<script>
import SSH from './ssh'
import RDP from './rdp'
import VNC from './vnc'
import Database from './database'
import K8S from './k8s'
import TELNET from './telnet'

export default {
  name: 'SystemUserCreateUpdate',
  components: { SSH, RDP, VNC, Database },
  data() {
    return {
    }
  },
  method: {
  },
  computed: {
    iTitle() {
      const params = this.$route.params
      let title = ''
      if (params.id) {
        title = this.$t('route.SystemUserUpdate')
      } else {
        title = this.$t('route.SystemUserCreate')
      }
      return title + '-' + this.$t('assets.CommonUser')
    },
    systemUserProtocolComponent() {
      const query = this.$route.query
      const protocol = query.protocol
      switch (protocol) {
        case 'ssh':
          return SSH
        case 'rdp':
          return RDP
        case 'vnc':
          return VNC
        case 'telnet':
          return TELNET
        case 'mysql':
        case 'oracle':
        case 'postgresql':
        case 'mariadb':
        case 'sqlserver':
        case 'redis':
        case 'mongodb':
          return Database
        case 'k8s':
          return K8S
        default:
          return SSH
      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
