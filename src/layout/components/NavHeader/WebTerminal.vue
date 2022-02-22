<template>
  <el-link :href="webTerminalUrl" target="_blank">
    <svg-icon icon-class="terminal" />
  </el-link>
</template>

<script>
import { BASE_URL } from '@/utils/common'

export default {
  name: 'WebTerminal',
  computed: {
    webTerminalUrl() {
      return `${BASE_URL}/luna/?_=${Date.now()}`
    }
  }
}
</script>

<style scoped>
</style>
