<template>
  <component :is="systemUserProtocolComponent" />
</template>

<script>
import SSH from './ssh'
import RDP from './rdp'
import VncOrTelnet from './vncAndTelnet'
import Database from './database'
import K8S from './k8s'

export default {
  name: 'SystemUserCreateUpdate',
  components: { SSH, RDP, VncOrTelnet, Database },
  data() {
    return {
    }
  },
  method: {
  },
  computed: {
    systemUserProtocolComponent() {
      const query = this.$route.query
      const protocol = query.protocol
      switch (protocol) {
        case 'ssh':
          return SSH
        case 'rdp':
          return RDP
        case 'vnc':
        case 'telnet':
          return VncOrTelnet
        case 'mysql':
        case 'oracle':
        case 'postgresql':
        case 'mariadb':
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
