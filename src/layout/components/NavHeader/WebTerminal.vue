<template>
  <el-link class="el-link" :href="webTerminalUrl" target="_blank">{{ $t('route.WebTerminal') }}</el-link>
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
.el-link {
  color: #606266 !important;
  font-size: 13px;
  font-weight: 400
}
</style>
