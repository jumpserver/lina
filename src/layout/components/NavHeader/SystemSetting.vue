<template>
  <el-link @click="goto()">
    <svg-icon icon-class="nav-setting" />
  </el-link>
</template>

<script>
import { getFirstAccessibleChildPath } from '@/utils/vue'

export default {
  name: 'WebTerminal',
  computed: {},
  methods: {
    goto() {
      const path = getFirstAccessibleChildPath('/settings') || '/settings/basic'
      if (this.$route.path === path) {
        return
      }
      this.$router.push(path)
    }
  }
}
</script>

<style scoped></style>
