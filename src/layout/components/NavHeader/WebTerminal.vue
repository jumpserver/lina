<template>
  <el-link :href="webTerminalUrl" target="_blank">
    <svg-icon icon-class="terminal" style="font-size: 17px" />
  </el-link>
</template>

<script>
import { BASE_URL } from '@/utils/common'

export default {
  name: 'WebTerminal',
  computed: {
    webTerminalUrl() {
      const oid = this.$store.getters.currentOrg ? this.$store.getters.currentOrg.id : ''
      let url = `${BASE_URL}/luna/?_=${Date.now()}${oid ? `&oid=${oid}` : ''}`
      if (process.env.NODE_ENV !== 'production') {
        url = url.replace('9528', '4200')
      }
      return url
    }
  }
}
</script>

<style scoped>
</style>
