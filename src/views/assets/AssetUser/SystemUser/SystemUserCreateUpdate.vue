<template>
  <component :is="activePage" />
</template>

<script>
import SSH from './components/ssh'
import RDP from './components/rdp'
import VncAndTelnet from './components/vncAndTelnet'
import DATABASE from './components/database'
import K8S from './components/k8s'

export default {
  name: 'SystemUserCreateUpdate',
  components: { SSH, RDP, VncAndTelnet, DATABASE },
  data() {
    return {
    }
  },
  method: {
  },
  computed: {
    activePage() {
      const query = this.$route.query
      const protocol = query.protocol
      switch (protocol) {
        case 'ssh':
          return SSH
        case 'rdp':
          return RDP
        case 'vnc':
        case 'telnet':
          return VncAndTelnet
        case 'mysql':
        case 'oracle':
        case 'postgresql':
        case 'mariadb':
          return DATABASE
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
