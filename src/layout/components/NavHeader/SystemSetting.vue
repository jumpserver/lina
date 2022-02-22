<template>
  <el-link @click="goto()">
    <i class="el-icon-s-tools" @click="goto()" />
  </el-link>
</template>

<script>

export default {
  name: 'WebTerminal',
  computed: {},
  methods: {
    goto() {
      this.$router.push({ name: 'SystemSetting' })
    }
  }
}
</script>

<style scoped>
</style>
