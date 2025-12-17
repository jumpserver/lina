<template>
  <el-link @click="goto()">
    <svg-icon icon-class="nav-setting" @click="goto()" />
  </el-link>
</template>

<script lang="jsx">

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
