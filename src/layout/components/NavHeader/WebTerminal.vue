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
      let url = `${BASE_URL}/luna/?_=${Date.now()}`
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
