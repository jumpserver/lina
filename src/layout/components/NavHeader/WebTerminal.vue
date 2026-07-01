<template>
  <el-link :href="webTerminalUrl" target="_blank">
    <svg-icon icon-class="terminal" />
  </el-link>
</template>

<script>
import { BASE_URL } from '@/utils/common/index'
import { IS_PROD } from '@/utils/env'

export default {
  name: 'WebTerminal',
  computed: {
    webTerminalUrl() {
      const oid = this.$store.getters.currentOrg ? this.$store.getters.currentOrg.id : ''
      let url = `${BASE_URL}/luna/?_=${Date.now()}${oid ? `&oid=${oid}` : ''}`
      if (!IS_PROD) {
        url = url.replace('9528', '4200')
      }
      return url
    }
  }
}
</script>

<style scoped></style>
