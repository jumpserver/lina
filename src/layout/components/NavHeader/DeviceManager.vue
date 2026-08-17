<template>
  <el-link @click="goto()">
    <svg-icon icon-class="device" />
  </el-link>
</template>

<script>
import { openJDMC } from '@/utils/jdmc'

export default {
  name: 'DeviceManager',
  methods: {
    goto() {
      openJDMC('/jdmc/')
    }
  }
}
</script>

<style scoped>
</style>
