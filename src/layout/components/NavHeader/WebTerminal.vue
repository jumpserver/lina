<template>
  <el-link class="el-link" :href="webTerminalUrl" target="_blank">
    <span class="fa-stack" style="font-size: .85em;">
      <i class="fa fa-square-o fa-stack-2x" />
      <i class="fa fa-terminal fa-stack-1x" />
    </span>
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
.el-link {
  color: #606266 !important;
  font-size: 13px;
  font-weight: 400
}
</style>
